/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import mongoose from "mongoose";

export const aboutSchema = new mongoose.Schema({
  lines: { type: [String], default: [] },
});

export const AboutPage = mongoose.model("AboutPage", aboutSchema);
