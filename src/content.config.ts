import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        pkg: z.enum(["mod-types", "utils"]).optional(),
        stamp: z.string().max(16).optional(),
        version: z.string().optional(),
      }),
    }),
  }),
};
