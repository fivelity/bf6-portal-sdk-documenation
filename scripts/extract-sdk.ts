/**
 * extract-sdk.ts
 *
 * Parses the real `.d.ts` files of `bf6-portal-mod-types` and `bf6-portal-utils` with the
 * TypeScript compiler API and emits a single JSON document (`sdk-data.json`) that the docs SPA
 * renders. Nothing in the site is hand-typed API data, so it cannot drift from the packages.
 *
 * Run (Node >= 22.18, or Node 22.6+ with --experimental-strip-types):
 *
 *   npm i -D typescript
 *   npm i -D bf6-portal-mod-types@4.2.0 bf6-portal-utils@9.4.0
 *   node scripts/extract-sdk.ts \
 *     --mod   node_modules/bf6-portal-mod-types \
 *     --utils node_modules/bf6-portal-utils \
 *     --out   sdk-data.json \
 *     --inline index.html          # optional: also embeds the JSON into the SPA
 *
 * No `any` anywhere: compiler nodes are narrowed with the `ts.is*` guards.
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/* ------------------------------------------------------------------------------------------------
 * Output schema (mirrored by the JSDoc typedefs in index.html)
 * ---------------------------------------------------------------------------------------------- */

export interface ParamInfo {
    name: string;
    type: string;
    optional: boolean;
    rest: boolean;
    doc: string;
}

export interface Doc {
    summary: string;
    params: Record<string, string>;
    returns: string;
    examples: string[];
    notes: string[];
    todo: string[];
    deprecated: string;
}

export interface Overload {
    signature: string;
    params: ParamInfo[];
    returns: string;
    returnsDoc: string;
    doc: string;
    examples: string[];
    notes: string[];
    todo: string[];
}

export interface ModFunction {
    name: string;
    category: string;
    documented: boolean;
    overloads: Overload[];
}

export interface ModCategory {
    id: string;
    title: string;
    blurb: string;
}

export interface ModType {
    name: string;
    definition: string;
    opaque: boolean;
    doc: string;
    todo: string[];
}

export interface EnumMember {
    name: string;
    value: number;
}

export interface EnumInfo {
    name: string;
    members: EnumMember[];
}

export interface EventSignature {
    name: string;
    doc: string;
    params: ParamInfo[];
    signature: string;
}

export interface SpawnEnum {
    name: string;
    label: string;
    members: string[];
}

export type ApiKind =
    | 'function'
    | 'class'
    | 'interface'
    | 'type'
    | 'enum'
    | 'const'
    | 'namespace'
    | 'method'
    | 'property'
    | 'constructor'
    | 'accessor'
    | 'member';

export interface ApiEntry {
    kind: ApiKind;
    name: string;
    exported: boolean;
    signature: string;
    doc: string;
    params: ParamInfo[];
    returns: string;
    returnsDoc: string;
    examples: string[];
    notes: string[];
    isStatic: boolean;
    members: ApiEntry[];
}

export interface UtilsModule {
    id: string;
    title: string;
    importPath: string;
    group: string;
    parent: string | null;
    summary: string;
    readme: string;
    api: ApiEntry[];
}

export interface ModuleGroup {
    id: string;
    title: string;
}

export interface PackageMeta {
    name: string;
    version: string;
    description: string;
    license: string;
    repository: string;
    homepage: string;
}

export interface SdkData {
    generatedAt: string;
    mod: {
        pkg: PackageMeta;
        sdkVersion: string;
        readme: string;
        categories: ModCategory[];
        functions: ModFunction[];
        constants: ModType[];
        types: ModType[];
        enums: EnumInfo[];
        events: EventSignature[];
        spawnEnums: SpawnEnum[];
    };
    utils: {
        pkg: PackageMeta;
        readme: string;
        groups: ModuleGroup[];
        modules: UtilsModule[];
    };
}

/* ------------------------------------------------------------------------------------------------
 * CLI
 * ---------------------------------------------------------------------------------------------- */

function flag(name: string): string | undefined {
    const args = process.argv.slice(2);
    const at = args.indexOf(name);
    return at >= 0 ? args[at + 1] : undefined;
}

const modDir = path.resolve(flag('--mod') ?? 'node_modules/bf6-portal-mod-types');
const utilsDir = path.resolve(flag('--utils') ?? 'node_modules/bf6-portal-utils');
const outFile = path.resolve(flag('--out') ?? 'apps/docs/src/data/sdk-data.json');
const inlineFile = flag('--inline') ?? 'apps/docs/src/index.md';

/* ------------------------------------------------------------------------------------------------
 * Small helpers
 * ---------------------------------------------------------------------------------------------- */

const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim();
const stripDash = (s: string): string => s.replace(/^\s*-\s*/, '').trim();

function readText(file: string): string {
    return fs.readFileSync(file, 'utf8');
}

function parse(file: string): ts.SourceFile {
    return ts.createSourceFile(file, readText(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

interface PackageJson {
    name?: string;
    version?: string;
    description?: string;
    license?: string;
    homepage?: string;
    repository?: string | { url?: string };
}

function readPackageMeta(dir: string): PackageMeta {
    const json = JSON.parse(readText(path.join(dir, 'package.json'))) as PackageJson;
    const repo = typeof json.repository === 'string' ? json.repository : (json.repository?.url ?? '');
    return {
        name: json.name ?? '',
        version: json.version ?? '',
        description: json.description ?? '',
        license: json.license ?? '',
        repository: repo.replace(/^git\+/, '').replace(/\.git$/, ''),
        homepage: json.homepage ?? '',
    };
}

/** Removes the `<ai>` wrapper tags the utils READMEs use to mark generated sections. */
function cleanReadme(md: string): string {
    return md
        .split('\n')
        .filter((line) => !/^\s*<\/?ai>\s*$/.test(line))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/* ------------------------------------------------------------------------------------------------
 * Doc-comment extraction (JSDoc first, `//` line comments as fallback)
 * ---------------------------------------------------------------------------------------------- */

type WithJsDoc = ts.Node & { jsDoc?: ts.JSDoc[] };

const emptyDoc = (): Doc => ({ summary: '', params: {}, returns: '', examples: [], notes: [], todo: [], deprecated: '' });

function unfence(text: string): string {
    return text
        .replace(/^```[a-zA-Z]*\s*\n?/, '')
        .replace(/\n?```\s*$/, '')
        .trim();
}

function splitTodo(summary: string, doc: Doc): string {
    const kept: string[] = [];
    for (const line of summary.split('\n')) {
        const todo = /^\s*TODO:?\s*(.*)$/.exec(line);
        if (todo) doc.todo.push(todo[1]);
        else kept.push(line);
    }
    return kept.join('\n').trim();
}

/** Contiguous `//` comment lines directly above a node, ignoring commented-out code and lint directives. */
function lineCommentDoc(node: ts.Node, sf: ts.SourceFile): string {
    const ranges = ts.getLeadingCommentRanges(sf.text, node.getFullStart()) ?? [];
    const picked: string[] = [];
    let cursor = node.getStart(sf);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const r = ranges[i];
        if (r.kind !== ts.SyntaxKind.SingleLineCommentTrivia) break;
        const gap = sf.text.slice(r.end, cursor);
        if ((gap.match(/\n/g) ?? []).length > 1) break;
        const body = sf.text.slice(r.pos, r.end).replace(/^\/\/\s?/, '');
        cursor = r.pos;
        if (/eslint-|prettier-|^\s*(export|const|declare|type|let|function)\b/.test(body)) continue;
        picked.unshift(body.trim());
    }
    return picked.join(' ').trim();
}

function readDoc(node: ts.Node, sf: ts.SourceFile, allowLineComments = false): Doc {
    const doc = emptyDoc();
    const blocks = (node as WithJsDoc).jsDoc;
    const block = blocks && blocks.length > 0 ? blocks[blocks.length - 1] : undefined;

    if (block) {
        doc.summary = splitTodo(ts.getTextOfJSDocComment(block.comment)?.trim() ?? '', doc);
        for (const tag of block.tags ?? []) {
            const text = ts.getTextOfJSDocComment(tag.comment)?.trim() ?? '';
            if (ts.isJSDocParameterTag(tag)) {
                doc.params[tag.name.getText(sf)] = stripDash(text);
            } else if (ts.isJSDocReturnTag(tag)) {
                doc.returns = stripDash(text);
            } else {
                const name = tag.tagName.text;
                if (name === 'example') doc.examples.push(unfence(text));
                else if (name === 'deprecated') doc.deprecated = text || 'Deprecated.';
                else if (name === 'remarks' || name === 'note' || name === 'throws' || name === 'see') {
                    if (text) doc.notes.push(text);
                }
            }
        }
    } else if (allowLineComments) {
        doc.summary = splitTodo(lineCommentDoc(node, sf), doc);
    }
    return doc;
}

/* ------------------------------------------------------------------------------------------------
 * Function-like extraction
 * ---------------------------------------------------------------------------------------------- */

function paramInfo(p: ts.ParameterDeclaration, sf: ts.SourceFile, doc: Doc): ParamInfo {
    const name = p.name.getText(sf);
    return {
        name,
        type: p.type ? collapse(p.type.getText(sf)) : 'unknown',
        optional: p.questionToken !== undefined || p.initializer !== undefined,
        rest: p.dotDotDotToken !== undefined,
        doc: doc.params[name] ?? '',
    };
}

function fnSignature(node: ts.SignatureDeclarationBase, sf: ts.SourceFile, lead: string): string {
    const typeParams = node.typeParameters ? `<${node.typeParameters.map((t) => collapse(t.getText(sf))).join(', ')}>` : '';
    const params = node.parameters.map((p) => collapse(p.getText(sf)));
    const ret = node.type ? `: ${collapse(node.type.getText(sf))}` : '';
    const oneLine = `${lead}${typeParams}(${params.join(', ')})${ret}`;
    if (oneLine.length <= 96 || params.length === 0) return oneLine;
    return `${lead}${typeParams}(\n${params.map((p) => `    ${p}`).join(',\n')}\n)${ret}`;
}

function returnType(node: ts.SignatureDeclarationBase, sf: ts.SourceFile): string {
    return node.type ? collapse(node.type.getText(sf)) : 'void';
}

function overloadOf(node: ts.SignatureDeclarationBase, sf: ts.SourceFile, lead: string, lineDocs: boolean): Overload {
    const doc = readDoc(node, sf, lineDocs);
    return {
        signature: fnSignature(node, sf, lead),
        params: node.parameters.map((p) => paramInfo(p, sf, doc)),
        returns: returnType(node, sf),
        returnsDoc: doc.returns,
        doc: doc.summary,
        examples: doc.examples,
        notes: doc.notes,
        todo: doc.todo,
    };
}

/* ------------------------------------------------------------------------------------------------
 * mod namespace: function categories
 * ---------------------------------------------------------------------------------------------- */

const CATEGORIES: ModCategory[] = [
    { id: 'lookup', title: 'Scene lookup', blurb: 'Resolve a runtime object from the ObjId you authored in the level.' },
    { id: 'player', title: 'Players', blurb: 'Read and change a single player: health, position, input, state and more.' },
    { id: 'ai', title: 'AI behavior', blurb: 'Direct AI soldiers: move, defend, parachute, idle, and target.' },
    { id: 'weapons', title: 'Weapons & gear', blurb: 'Weapon packages, gadgets, ammo, armor, and loadout changes.' },
    { id: 'game', title: 'Game mode', blurb: 'Match clock, scoring, team balance, deployment, and end-of-game control.' },
    { id: 'objectives', title: 'Objectives & triggers', blurb: 'Capture points, HQs, MCOMs, bombs, sectors, area triggers, and interact points.' },
    { id: 'spawners', title: 'Spawners & loot', blurb: 'Spawn points, AI and object spawners, loot, and runtime object spawning.' },
    { id: 'objects', title: 'Objects & movement', blurb: 'Move, rotate, orbit, and read the transform of any scene object.' },
    { id: 'vehicles', title: 'Vehicles', blurb: 'Vehicle spawners, seats, occupancy, and vehicle rules.' },
    { id: 'ui', title: 'UI widgets', blurb: 'Create, find, style, and remove on-screen widgets.' },
    { id: 'scoreboard', title: 'Scoreboard', blurb: 'Column names, widths, sorting, and header for the built-in scoreboard.' },
    { id: 'messages', title: 'Messages & notifications', blurb: 'Build localized messages and show them to players.' },
    { id: 'audio', title: 'Audio', blurb: 'Sound effects, voice-over, and music.' },
    { id: 'effects', title: 'Effects & icons', blurb: 'Visual effects, world icons, and cameras.' },
    { id: 'vectors', title: 'Vectors & transforms', blurb: 'Build and manipulate 3D vectors, directions, and transforms.' },
    { id: 'math', title: 'Math & logic', blurb: 'Arithmetic, trigonometry, comparison, and boolean logic.' },
    { id: 'arrays', title: 'Arrays & variables', blurb: 'Opaque arrays and the variable system.' },
    { id: 'general', title: 'Runtime & misc', blurb: 'Waiting, event comparisons, argument access, and other runtime helpers.' },
];

const MATH_NAMES = new Set([
    'Add', 'Subtract', 'Multiply', 'Divide', 'Modulo', 'RaiseToPower', 'SquareRoot', 'AbsoluteValue', 'Ceiling',
    'Floor', 'RoundToInteger', 'Max', 'Min', 'RandomReal', 'Pi', 'AngleDifference', 'DegreesToRadians',
    'RadiansToDegrees', 'GreaterThan', 'GreaterThanEqualTo', 'LessThan', 'LessThanEqualTo', 'And', 'Or', 'Not',
    'Xor', 'IfThenElse', 'Equals', 'NotEqualTo', 'IsType', 'IsUndefined', 'IsValid',
]);
const TRIG = /^(Arc(cosine|sine|tangent)In|(Sine|Cosine|Tangent)From)(Degrees|Radians)$/;
const OBJECT_TYPES =
    'SFX|VO|FixedCamera|VFX|SpawnPoint|RingOfFire|AreaTrigger|EmplacementSpawner|InteractPoint|LootSpawner|SpatialObject|Spawner|VL7Cloud|VehicleSpawner|CapturePoint|HQ|Bomb|MCOM|Sector|Player|Squad|Team|WorldIcon|Vehicle|WaypointPath';
const LOOKUP = new RegExp(`^Get(${OBJECT_TYPES})$`);

const OBJECTIVE_NAME = /Bomb|CapturePoint|MCOM|Sector|AreaTrigger|InteractPoint|RingOfFire|VL7Cloud|WaypointPath|HQ|Objective/;
const OBJECTIVE_TYPES = ['CapturePoint', 'HQ', 'MCOM', 'Sector', 'Bomb', 'AreaTrigger', 'InteractPoint', 'RingOfFire', 'VL7Cloud', 'WaypointPath'];

function categorize(name: string, firstParam: string): string {
    if (LOOKUP.test(name) && firstParam === 'number') return 'lookup';
    if (/^AI/.test(name)) return 'ai';
    if (/Scoreboard/.test(name)) return 'scoreboard';
    if (/^Display|SendErrorReport|SendPortalLog|^Message$|^Concat$|Notification|HighlightedWorldLog/.test(name)) return 'messages';
    if (/UI/.test(name) || firstParam === 'UIWidget') return 'ui';
    if (MATH_NAMES.has(name) || TRIG.test(name)) return 'math';
    if (/Vector|Transform|Direction/.test(name) || firstParam === 'Vector' || firstParam === 'Transform') return 'vectors';
    if (/Array|^(CountOf|FirstOf|LastOf|ValueInArray|SortedArray)$/.test(name) || firstParam === 'Array') return 'arrays';
    if (/Variable/.test(name) || firstParam === 'Variable') return 'arrays';
    if (/SFX|^VO|Music|Sound|^PlayVO|Audio/.test(name) || ['SFX', 'VO', 'MusicEvents', 'MusicParams', 'MusicPackages'].includes(firstParam)) return 'audio';
    if (/VFX|WorldIcon|Camera/.test(name) || ['VFX', 'WorldIcon', 'Cameras', 'FixedCamera'].includes(firstParam)) return 'effects';
    if (/Vehicle/.test(name) || ['Vehicle', 'VehicleSpawner'].includes(firstParam)) return 'vehicles';
    if (/Weapon|Gadget|Ammo|Armor|Loadout|Equipment|Throwable|Magazine/.test(name)) return 'weapons';
    if (OBJECTIVE_NAME.test(name) || OBJECTIVE_TYPES.includes(firstParam)) return 'objectives';
    if (/^SpawnObject$|Spawn|Loot/.test(name) || ['Spawner', 'SpawnPoint', 'EmplacementSpawner', 'LootSpawner'].includes(firstParam)) return 'spawners';
    if (/Object|ObjId/.test(name) || firstParam === 'mod.Object') return 'objects';
    if (/GameMode|Match|Round|[Dd]eploy|Balance|PlayerJoin|Score|FriendlyFire|SwitchTeams|Faction|RedeployTime|TimeLimit/.test(name)) return 'game';
    if (firstParam === 'Player' || /Player|Soldier/.test(name)) return 'player';
    if (firstParam === 'Team' || firstParam === 'Squad') return 'player';
    return 'general';
}

/* ------------------------------------------------------------------------------------------------
 * mod-types extraction
 * ---------------------------------------------------------------------------------------------- */

function namespaceStatements(sf: ts.SourceFile, name: string): readonly ts.Statement[] {
    for (const st of sf.statements) {
        if (ts.isModuleDeclaration(st) && st.name.text === name && st.body && ts.isModuleBlock(st.body)) {
            return st.body.statements;
        }
    }
    return [];
}

function extractModFunctions(sf: ts.SourceFile): { functions: ModFunction[]; constants: ModType[] } {
    const byName = new Map<string, ModFunction>();
    const constants: ModType[] = [];

    for (const st of namespaceStatements(sf, 'mod')) {
        if (ts.isFunctionDeclaration(st) && st.name) {
            const name = st.name.text;
            const first = st.parameters[0]?.type ? collapse(st.parameters[0].type.getText(sf)) : '';
            const overload = overloadOf(st, sf, `mod.${name}`, true);
            const existing = byName.get(name);
            if (existing) existing.overloads.push(overload);
            else byName.set(name, { name, category: categorize(name, first), documented: false, overloads: [overload] });
        } else if (ts.isVariableStatement(st)) {
            const doc = readDoc(st, sf);
            for (const d of st.declarationList.declarations) {
                constants.push({
                    name: d.name.getText(sf),
                    definition: d.type ? collapse(d.type.getText(sf)) : 'unknown',
                    opaque: false,
                    doc: doc.summary,
                    todo: doc.todo,
                });
            }
        }
    }

    const functions = [...byName.values()].map((fn) => ({
        ...fn,
        documented: fn.overloads.some((o) => o.doc.length > 0),
    }));
    functions.sort((a, b) => a.name.localeCompare(b.name));
    return { functions, constants };
}

function extractModTypes(sf: ts.SourceFile): ModType[] {
    const out: ModType[] = [];
    for (const st of namespaceStatements(sf, 'mod')) {
        if (!ts.isTypeAliasDeclaration(st)) continue;
        const doc = readDoc(st, sf);
        const definition = collapse(st.type.getText(sf));
        out.push({
            name: st.name.text,
            definition,
            opaque: definition.includes('_opaque'),
            doc: doc.summary,
            todo: doc.todo,
        });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
}

function extractEnums(sf: ts.SourceFile, namespaceName = 'mod'): EnumInfo[] {
    const out: EnumInfo[] = [];
    for (const st of namespaceStatements(sf, namespaceName)) {
        if (!ts.isEnumDeclaration(st)) continue;
        let next = 0;
        const members = st.members.map((m): EnumMember => {
            if (m.initializer && ts.isNumericLiteral(m.initializer)) next = Number(m.initializer.text);
            const value = next;
            next += 1;
            return { name: m.name.getText(sf), value };
        });
        out.push({ name: st.name.text, members });
    }
    return out;
}

function extractEvents(sf: ts.SourceFile): EventSignature[] {
    const out: EventSignature[] = [];
    for (const st of namespaceStatements(sf, 'mod')) {
        if (!ts.isModuleDeclaration(st) || st.name.text !== 'EventHandlerSignatures') continue;
        if (!st.body || !ts.isModuleBlock(st.body)) continue;
        for (const inner of st.body.statements) {
            if (!ts.isFunctionDeclaration(inner) || !inner.name) continue;
            const doc = readDoc(inner, sf);
            out.push({
                name: inner.name.text,
                doc: doc.summary,
                params: inner.parameters.map((p) => paramInfo(p, sf, doc)),
                signature: fnSignature(inner, sf, `function ${inner.name.text}`),
            });
        }
    }
    return out;
}

function humanizeMap(enumName: string): string {
    return enumName
        .replace(/^RuntimeSpawn_/, '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')
        .trim();
}

function extractSpawnEnums(dir: string): SpawnEnum[] {
    const out: SpawnEnum[] = [];
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.d.ts')).sort()) {
        for (const info of extractEnums(parse(path.join(dir, file)))) {
            out.push({
                name: info.name,
                label: info.name === 'RuntimeSpawn_Common' ? 'Common (all maps)' : humanizeMap(info.name),
                members: info.members.map((m) => m.name),
            });
        }
    }
    // Common first, then alphabetical by label.
    return out.sort((a, b) => {
        if (a.name === 'RuntimeSpawn_Common') return -1;
        if (b.name === 'RuntimeSpawn_Common') return 1;
        return a.label.localeCompare(b.label);
    });
}

/* ------------------------------------------------------------------------------------------------
 * bf6-portal-utils: generic declaration walker
 * ---------------------------------------------------------------------------------------------- */

const emptyEntry = (kind: ApiKind, name: string, exported: boolean): ApiEntry => ({
    kind,
    name,
    exported,
    signature: '',
    doc: '',
    params: [],
    returns: '',
    returnsDoc: '',
    examples: [],
    notes: [],
    isStatic: false,
    members: [],
});

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);
}

function stripDecl(text: string): string {
    return collapse(text).replace(/;$/, '').replace(/^(export\s+)?(declare\s+)?/, '');
}

/** Header of a class/interface/namespace/enum: everything before its member body. */
function headerOf(node: ts.ClassDeclaration | ts.InterfaceDeclaration | ts.EnumDeclaration, sf: ts.SourceFile): string {
    const start = node.getStart(sf);
    const end = node.members.pos;
    return stripDecl(sf.text.slice(start, end).replace(/\{\s*$/, ''));
}

/** Merges overload declarations that share a name into one entry (signatures joined by newline). */
function pushMerged(list: ApiEntry[], entry: ApiEntry): void {
    const existing = list.find((e) => e.name === entry.name && e.kind === entry.kind && e.isStatic === entry.isStatic);
    const isFn = entry.kind === 'function' || entry.kind === 'method' || entry.kind === 'constructor';
    if (!existing || !isFn) {
        list.push(entry);
        return;
    }
    existing.signature += `\n${entry.signature}`;
    if (!existing.doc && entry.doc) {
        existing.doc = entry.doc;
        existing.params = entry.params;
        existing.returnsDoc = entry.returnsDoc;
        existing.examples = entry.examples;
        existing.notes = entry.notes;
    }
}

function fnEntry(node: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ConstructorDeclaration, sf: ts.SourceFile, kind: ApiKind, name: string, exported: boolean): ApiEntry {
    const doc = readDoc(node, sf);
    const isStatic = hasModifier(node, ts.SyntaxKind.StaticKeyword);
    const readonlyLead = isStatic ? 'static ' : '';
    const lead = kind === 'function' ? `function ${name}` : kind === 'constructor' ? 'constructor' : `${readonlyLead}${name}`;
    const entry = emptyEntry(kind, name, exported);
    entry.signature = fnSignature(node, sf, lead);
    entry.doc = doc.summary;
    entry.params = node.parameters.map((p) => paramInfo(p, sf, doc));
    entry.returns = kind === 'constructor' ? '' : returnType(node, sf);
    entry.returnsDoc = doc.returns;
    entry.examples = doc.examples;
    entry.notes = doc.notes;
    entry.isStatic = isStatic;
    return entry;
}

function classMembers(node: ts.ClassDeclaration, sf: ts.SourceFile): ApiEntry[] {
    const out: ApiEntry[] = [];
    for (const m of node.members) {
        if (hasModifier(m, ts.SyntaxKind.PrivateKeyword) || hasModifier(m, ts.SyntaxKind.ProtectedKeyword)) continue;
        if (ts.isConstructorDeclaration(m)) {
            pushMerged(out, fnEntry(m, sf, 'constructor', 'constructor', true));
        } else if (ts.isMethodDeclaration(m)) {
            const name = m.name.getText(sf);
            if (name.startsWith('#')) continue;
            pushMerged(out, fnEntry(m, sf, 'method', name, true));
        } else if (ts.isPropertyDeclaration(m)) {
            const name = m.name.getText(sf);
            if (name.startsWith('#')) continue;
            const e = emptyEntry('property', name, true);
            const doc = readDoc(m, sf);
            e.signature = stripDecl(m.getText(sf));
            e.doc = doc.summary;
            e.returns = m.type ? collapse(m.type.getText(sf)) : 'unknown';
            e.isStatic = hasModifier(m, ts.SyntaxKind.StaticKeyword);
            out.push(e);
        } else if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
            const name = m.name.getText(sf);
            const e = emptyEntry('accessor', name, true);
            const doc = readDoc(m, sf);
            e.signature = stripDecl(m.getText(sf));
            e.doc = doc.summary;
            e.returns = ts.isGetAccessorDeclaration(m) && m.type ? collapse(m.type.getText(sf)) : '';
            e.isStatic = hasModifier(m, ts.SyntaxKind.StaticKeyword);
            const twin = out.find((x) => x.kind === 'accessor' && x.name === name && x.isStatic === e.isStatic);
            if (twin) twin.signature += `\n${e.signature}`;
            else out.push(e);
        }
    }
    return out;
}

function interfaceMembers(node: ts.InterfaceDeclaration, sf: ts.SourceFile): ApiEntry[] {
    const out: ApiEntry[] = [];
    for (const m of node.members) {
        const doc = readDoc(m, sf);
        if (ts.isPropertySignature(m)) {
            const e = emptyEntry('property', m.name.getText(sf), true);
            e.signature = stripDecl(m.getText(sf));
            e.doc = doc.summary;
            e.returns = m.type ? collapse(m.type.getText(sf)) : 'unknown';
            out.push(e);
        } else if (ts.isMethodSignature(m)) {
            const name = m.name.getText(sf);
            const e = emptyEntry('method', name, true);
            e.signature = fnSignature(m, sf, name);
            e.doc = doc.summary;
            e.params = m.parameters.map((p) => paramInfo(p, sf, doc));
            e.returns = returnType(m, sf);
            e.returnsDoc = doc.returns;
            pushMerged(out, e);
        }
    }
    return out;
}

function enumMembers(node: ts.EnumDeclaration, sf: ts.SourceFile): ApiEntry[] {
    return node.members.map((m) => {
        const e = emptyEntry('member', m.name.getText(sf), true);
        e.signature = collapse(m.getText(sf));
        e.doc = readDoc(m, sf).summary;
        return e;
    });
}

function extractDeclarations(statements: readonly ts.Statement[], sf: ts.SourceFile, topLevel: boolean): ApiEntry[] {
    const out: ApiEntry[] = [];
    for (const st of statements) {
        const exported = topLevel ? hasModifier(st, ts.SyntaxKind.ExportKeyword) : true;

        if (ts.isFunctionDeclaration(st) && st.name) {
            pushMerged(out, fnEntry(st, sf, 'function', st.name.text, exported));
        } else if (ts.isClassDeclaration(st) && st.name) {
            const e = emptyEntry('class', st.name.text, exported);
            const doc = readDoc(st, sf);
            e.signature = headerOf(st, sf);
            e.doc = doc.summary;
            e.examples = doc.examples;
            e.notes = doc.notes;
            e.members = classMembers(st, sf);
            out.push(e);
        } else if (ts.isInterfaceDeclaration(st)) {
            const e = emptyEntry('interface', st.name.text, exported);
            const doc = readDoc(st, sf);
            e.signature = headerOf(st, sf);
            e.doc = doc.summary;
            e.members = interfaceMembers(st, sf);
            out.push(e);
        } else if (ts.isTypeAliasDeclaration(st)) {
            const e = emptyEntry('type', st.name.text, exported);
            const doc = readDoc(st, sf);
            const text = stripDecl(st.getText(sf));
            e.signature = text.length > 700 ? `${text.slice(0, 700)} …` : text;
            e.doc = doc.summary;
            out.push(e);
        } else if (ts.isEnumDeclaration(st)) {
            const e = emptyEntry('enum', st.name.text, exported);
            e.signature = headerOf(st, sf);
            e.doc = readDoc(st, sf).summary;
            e.members = enumMembers(st, sf);
            out.push(e);
        } else if (ts.isVariableStatement(st)) {
            const doc = readDoc(st, sf);
            for (const d of st.declarationList.declarations) {
                const e = emptyEntry('const', d.name.getText(sf), exported);
                e.signature = stripDecl(`const ${d.name.getText(sf)}${d.type ? `: ${d.type.getText(sf)}` : ''}`);
                e.doc = doc.summary;
                e.returns = d.type ? collapse(d.type.getText(sf)) : 'unknown';
                out.push(e);
            }
        } else if (ts.isModuleDeclaration(st) && st.body && ts.isModuleBlock(st.body)) {
            const e = emptyEntry('namespace', st.name.text, exported);
            const doc = readDoc(st, sf);
            e.signature = `namespace ${st.name.text}`;
            e.doc = doc.summary;
            e.members = extractDeclarations(st.body.statements, sf, false);
            out.push(e);
        }
    }
    return out;
}

/* ------------------------------------------------------------------------------------------------
 * bf6-portal-utils modules
 * ---------------------------------------------------------------------------------------------- */

const GROUPS: Array<ModuleGroup & { ids: string[] }> = [
    { id: 'runtime', title: 'Runtime & events', ids: ['events', 'timers', 'clocks', 'callback-handler', 'player-undeploy-fixer', 'mod-extensions'] },
    { id: 'diagnostics', title: 'Diagnostics', ids: ['logging', 'logger', 'performance-stats', 'benchmarker'] },
    { id: 'interface', title: 'Interface', ids: ['ui', 'solid-ui'] },
    { id: 'gameplay', title: 'Gameplay & world', ids: ['ffa-spawn-points', 'ffa-drop-ins', 'scavenger-drop', 'portal-gadget', 'raycast', 'multi-click-detector', 'sounds', 'map-detector', 'vectors'] },
];

function findModuleDirs(root: string): string[] {
    const found: string[] = [];
    const walk = (dir: string): void => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
            const child = path.join(dir, entry.name);
            if (fs.existsSync(path.join(child, 'index.d.ts'))) found.push(path.relative(root, child).split(path.sep).join('/'));
            walk(child);
        }
    };
    walk(root);
    return found.sort();
}

function firstParagraph(md: string): string {
    const body = md.replace(/^# .*\n/, '').trim();
    for (const block of body.split(/\n\s*\n/)) {
        const text = block.trim();
        if (text && !text.startsWith('#') && !text.startsWith('```') && !text.startsWith('---')) {
            return text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ');
        }
    }
    return '';
}

function extractUtils(root: string): SdkData['utils'] {
    const rootReadme = cleanReadme(readText(path.join(root, 'README.md')));

    // Root README bullets look like: - **[Timers Module](./timers/)** – Description…
    const summaries = new Map<string, { title: string; summary: string }>();
    for (const m of rootReadme.matchAll(/^- \*\*\[(.+?)(?: Module)?\]\(\.\/([^)]+?)\/?\)\*\*\s*[–-]\s*(.+)$/gm)) {
        summaries.set(m[2], { title: m[1], summary: m[3].trim() });
    }

    const modules: UtilsModule[] = [];
    for (const id of findModuleDirs(root)) {
        const dir = path.join(root, id);
        const readmePath = path.join(dir, 'README.md');
        const readme = fs.existsSync(readmePath) ? cleanReadme(readText(readmePath)) : '';
        const known = summaries.get(id);
        const parent = id.includes('/components/') ? id.split('/components/')[0] : null;
        const h1 = /^# (.+)$/m.exec(readme)?.[1]?.replace(/\s*(Module|Component)$/, '');
        const group = GROUPS.find((g) => g.ids.includes(id) || (parent !== null && g.ids.includes(parent)));
        const sf = parse(path.join(dir, 'index.d.ts'));

        modules.push({
            id,
            title: known?.title ?? h1 ?? id,
            importPath: `bf6-portal-utils/${id}`,
            group: group?.id ?? 'gameplay',
            parent,
            summary: known?.summary ?? firstParagraph(readme),
            readme,
            api: extractDeclarations(sf.statements, sf, true),
        });
    }

    return {
        pkg: readPackageMeta(root),
        readme: rootReadme,
        groups: GROUPS.map(({ id, title }) => ({ id, title })),
        modules,
    };
}

/* ------------------------------------------------------------------------------------------------
 * Assemble
 * ---------------------------------------------------------------------------------------------- */

function buildModData(root: string): SdkData['mod'] {
    const indexSf = parse(path.join(root, 'index.d.ts'));
    const typesSf = parse(path.join(root, 'types.d.ts'));
    const enumsSf = parse(path.join(root, 'enums.d.ts'));
    const eventsSf = parse(path.join(root, 'event-handler-signatures.d.ts'));

    const { functions, constants } = extractModFunctions(indexSf);
    const used = new Set(functions.map((f) => f.category));
    const version = /Version:\s*([\d.]+)/.exec(readText(path.join(root, 'index.d.ts')))?.[1] ?? '';

    return {
        pkg: readPackageMeta(root),
        sdkVersion: version,
        readme: readText(path.join(root, 'README.md')),
        categories: CATEGORIES.filter((c) => used.has(c.id)),
        functions,
        constants,
        types: extractModTypes(typesSf),
        enums: extractEnums(enumsSf).sort((a, b) => a.name.localeCompare(b.name)),
        events: extractEvents(eventsSf),
        spawnEnums: extractSpawnEnums(path.join(root, 'runtime-spawn-enums')),
    };
}

const data: SdkData = {
    generatedAt: new Date().toISOString(),
    mod: buildModData(modDir),
    utils: extractUtils(utilsDir),
};

const json = JSON.stringify(data);
fs.writeFileSync(outFile, json);
console.log(`wrote ${path.relative(process.cwd(), outFile)} (${(json.length / 1024).toFixed(0)} KB)`);
console.log(
    `  mod   ${data.mod.pkg.version}: ${data.mod.functions.length} functions, ${data.mod.types.length} types, ` +
        `${data.mod.enums.length} enums, ${data.mod.events.length} events, ${data.mod.spawnEnums.length} spawn enums`,
);
console.log(`  utils ${data.utils.pkg.version}: ${data.utils.modules.length} modules`);

if (inlineFile) {
    const target = path.resolve(inlineFile);
    if (fs.existsSync(target)) {
        const html = readText(target);
        const START = '<!--SDK-DATA-START-->';
        const END = '<!--SDK-DATA-END-->';
        const a = html.indexOf(START);
        const b = html.indexOf(END);
        if (a >= 0 && b >= 0) {
            // "</" must not appear literally inside a <script> block.
            const safe = json.replace(/<\//g, '<\\/');
            const block = `${START}<script id="sdk-data" type="application/json">${safe}</script>${END}`;
            fs.writeFileSync(target, html.slice(0, a) + block + html.slice(b + END.length));
            console.log(`  inlined into ${path.relative(process.cwd(), target)}`);
        }
    }
}
