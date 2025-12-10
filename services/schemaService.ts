
import { RAW_PD360_HEADERS } from '../constants';
import { PD360Schema } from '../types';

export const SchemaService = {
  getSchema: (): PD360Schema => {
    // 1. Clean the raw string
    const headers = RAW_PD360_HEADERS.replace(/(\r\n|\n|\r)/gm, "").split('","').map(h => h.replace(/"/g, ''));
    
    const schema: PD360Schema = {
      meta: {
        version: "2025-12-09",
        source_file: "hubspot-crm-exports-pd360-overview-2025-12-09.csv",
      },
      categories: {
        IB: { label: "Inappropriate Behaviors", description: "Liability & Behavior Issues", fields: [] },
        OB: { label: "Obedience Skills", description: "Core Commands", fields: [] },
        SB: { label: "Social Behaviors", description: "Socialization & Confidence", fields: [] },
        ST: { label: "Stressors & Triggers", description: "Environmental Factors", fields: [] },
        TR: { label: "Tricks", description: "Advanced Moves", fields: [] },
        SCORES: { label: "PD360 Scorecard", description: "Calculated Metrics", fields: [] }
      }
    };

    headers.forEach(header => {
      let category = null;
      let label = header;
      let isCritical = false;
      let maxScore = undefined;

      // A. Detect Categories based on Prefix
      if (header.startsWith("IB_")) category = "IB";
      else if (header.startsWith("OB_")) category = "OB";
      else if (header.startsWith("SB_")) category = "SB";
      else if (header.startsWith("ST_")) category = "ST";
      else if (header.startsWith("TR_")) category = "TR";
      else if (header.includes("PD360")) category = "SCORES";

      if (category && category !== "SCORES") {
        // B. CLEANUP: "IB_Aggressive Behavior_TC" -> "Aggressive Behavior"
        let cleanLabel = header.substring(3); // Remove Prefix (IB_)
        
        // Remove Suffix (everything after the last underscore if it's a short code like _TC, _PS)
        const lastUnderscore = cleanLabel.lastIndexOf('_');
        if (lastUnderscore > -1 && cleanLabel.length - lastUnderscore <= 4) {
          cleanLabel = cleanLabel.substring(0, lastUnderscore);
        }

        // LIABILITY LOGIC: Detect Keywords
        if (["Aggressive", "Biting", "Nipping", "Growling", "Resource Guarding"].some(w => cleanLabel.includes(w))) {
          isCritical = true;
        }

        schema.categories[category].fields.push({
          label: cleanLabel,
          key: header,
          is_liability: isCritical
        });
      } 
      
      // C. SCORE PARSING: "[130/650] PD360 Total Score"
      else if (category === "SCORES") {
         const scoreMatch = header.match(/\/(\d+)\]/);
         if (scoreMatch) {
           maxScore = parseInt(scoreMatch[1]);
         }

         // Clean Name
         const cleanScoreName = header.replace(/\[.*?\]\s*PD360\s*/, "");

         schema.categories.SCORES.fields.push({
           label: cleanScoreName,
           key: header,
           max_points: maxScore
         });
      }
    });

    return schema;
  }
};

export const usePD360Schema = () => {
  return SchemaService.getSchema();
};
