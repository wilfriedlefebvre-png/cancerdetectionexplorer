"use client";

import React, {useMemo, useState, useEffect} from "react";
import dynamic from "next/dynamic";



// ---------------------------------------------

// Body Condition Explorer — Single-file React app

// Drop this component into a Next.js 13+ project at app/page.tsx

// No external libraries required. Pure React + inline styles.

// ---------------------------------------------



// ========== Types ==========



type SeverityStage = {

  stage: number;

  label: string;

  description: string;

  treatment?: string[]; // Treatment recommendations for this stage

};



type Condition = {

  id: string;

  name: string;

  category: "Infectious" | "Cardiovascular" | "Respiratory" | "Neurologic" | "Gastrointestinal" | "Renal" | "Endocrine" | "Musculoskeletal" | "Dermatologic" | "Oncology" | "Hematologic" | "Reproductive" | "Psychiatric" | "Ophthalmologic" | "Otolaryngologic" | "Dental" | "Autoimmune" | "Metabolic" | "Other";

  systems: string[]; // e.g., ["Nervous system"]

  regions: BodyRegionKey[]; // which map to SVG layer ids

  overview: string;

  symptoms: string[];

  untreatedRisks: string[]; // generalized educational risks (NOT medical advice)

  severity: SeverityStage[]; // ordered

  emergencySigns?: string[]; // red flags for immediate care

  typicalCourse?: string; // brief course description

  earlyDetectionAge?: number; // Recommended age to start screening/early detection (in years)

};



// ========== Body Regions ==========



type BodyRegionKey =

  | "head"

  | "neck"

  | "chest"

  | "abdomen"

  | "pelvis"

  | "l_arm"

  | "r_arm"

  | "l_leg"

  | "r_leg"

  | "back"

  | "skin";



const REGION_LABELS: Record<BodyRegionKey, string> = {

  head: "Head",

  neck: "Neck",

  chest: "Chest",

  abdomen: "Abdomen",

  pelvis: "Pelvis",

  l_arm: "Left Arm",

  r_arm: "Right Arm",

  l_leg: "Left Leg",

  r_leg: "Right Leg",

  back: "Back/Spine",

  skin: "Skin (general)",

};



// ========== Sample Dataset ==========

// Educational, simplified, and non-exhaustive. Not medical advice.



const CONDITIONS = [

  // ========== CANCER CONDITIONS ONLY ==========

  {
    id: "melanoma",
    name: "Skin Melanoma",
    category: "Oncology",
    systems: ["Skin/Immune"],
    regions: ["skin"],
    overview: "Malignant tumor of melanocytes. Early detection is critical.",
    symptoms: ["Changing mole", "Asymmetry, irregular borders", "Color variation", "Growth or bleeding"],
    untreatedRisks: ["Local invasion", "Metastasis to lymph nodes/organs", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "In situ or thin lesion; high cure rates if treated.", treatment: ["Surgical excision with margins", "Sentinel lymph node biopsy if indicated", "Regular skin self-examinations", "Sun protection and avoidance", "Regular dermatology follow-up"] },
      { stage: 2, label: "Regional", description: "Spread to nearby lymph nodes.", treatment: ["Wide local excision", "Lymph node dissection", "Adjuvant immunotherapy (checkpoint inhibitors)", "Targeted therapy if BRAF mutation present", "Oncology referral"] },
      { stage: 3, label: "Distant", description: "Metastatic disease; systemic therapy required.", treatment: ["Systemic immunotherapy (pembrolizumab, nivolumab)", "Targeted therapy (BRAF/MEK inhibitors)", "Chemotherapy if other options fail", "Radiation for symptomatic metastases", "Clinical trial consideration"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "basal-cell-carcinoma",
    name: "Basal Cell Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin"],
    overview: "Most common type of skin cancer, rarely metastasizes.",
    symptoms: ["Pearl-like bump", "Flat, scaly patch", "Sore that doesn't heal", "Waxy scar"],
    untreatedRisks: ["Local invasion", "Tissue destruction", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Superficial", description: "Confined to epidermis.", treatment: ["Surgical excision", "Mohs surgery for face", "Topical imiquimod", "Curettage and electrodesiccation", "Regular skin checks"] },
      { stage: 2, label: "Infiltrative", description: "Invades deeper tissues.", treatment: ["Mohs micrographic surgery", "Wide local excision", "Radiation therapy", "Regular follow-up", "Dermatology/oncology care"] },
      { stage: 3, label: "Advanced", description: "Large or metastatic (rare).", treatment: ["Surgery", "Radiation", "Systemic therapy (vismodegib, sonidegib)", "Clinical trials", "Multidisciplinary care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "squamous-cell-carcinoma",
    name: "Squamous Cell Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin"],
    overview: "Second most common skin cancer, can metastasize.",
    symptoms: ["Firm red nodule", "Flat scaly patch", "Sore that doesn't heal", "Wart-like growth"],
    untreatedRisks: ["Local invasion", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to skin.", treatment: ["Surgical excision", "Mohs surgery", "Curettage and electrodesiccation", "Regular monitoring", "Sun protection"] },
      { stage: 2, label: "Locally Advanced", description: "Invades deeper tissues or lymph nodes.", treatment: ["Wide local excision", "Lymph node dissection", "Radiation therapy", "Regular follow-up", "Oncology care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy (cemiplimab)", "Radiation for metastases", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "leukemia",
    name: "Leukemia",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest", "skin"],
    overview: "Cancer of blood-forming tissues, including bone marrow.",
    symptoms: ["Fatigue", "Frequent infections", "Easy bruising/bleeding", "Fever"],
    untreatedRisks: ["Death", "Severe infections", "Bleeding complications"],
    severity: [
      { stage: 1, label: "Early", description: "Newly diagnosed, good prognosis.", treatment: ["Chemotherapy", "Targeted therapy", "Supportive care", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Intermediate", description: "More advanced disease.", treatment: ["Intensive chemotherapy", "Bone marrow transplant consideration", "Targeted therapies", "Clinical trials", "Hematology-oncology care"] },
      { stage: 3, label: "Advanced", description: "Relapsed or refractory disease.", treatment: ["Salvage chemotherapy", "Bone marrow transplant", "CAR-T cell therapy", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "acute-lymphoblastic-leukemia",
    name: "Acute Lymphoblastic Leukemia (ALL)",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest"],
    overview: "Aggressive leukemia affecting lymphoid cells, common in children.",
    symptoms: ["Fatigue", "Bleeding", "Bone pain", "Fever"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Standard Risk", description: "Good prognosis factors.", treatment: ["Multi-agent chemotherapy", "CNS prophylaxis", "Maintenance therapy", "High cure rates in children", "Hematology-oncology care"] },
      { stage: 2, label: "High Risk", description: "Poor prognosis factors.", treatment: ["Intensive chemotherapy", "Stem cell transplant", "Targeted therapy (imatinib if Ph+)", "CAR-T cell therapy", "Clinical trials"] },
      { stage: 3, label: "Relapsed/Refractory", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "CAR-T cell therapy (blinatumomab)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "acute-myeloid-leukemia",
    name: "Acute Myeloid Leukemia (AML)",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest"],
    overview: "Aggressive leukemia affecting myeloid cells.",
    symptoms: ["Fatigue", "Bleeding", "Infections", "Fever"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Favorable", description: "Good cytogenetics.", treatment: ["Induction chemotherapy", "Consolidation chemotherapy", "High cure rates", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Intermediate/Adverse", description: "Standard or poor cytogenetics.", treatment: ["Intensive chemotherapy", "Stem cell transplant", "Targeted therapy (FLT3 inhibitors)", "Regular monitoring", "Clinical trials"] },
      { stage: 3, label: "Relapsed/Refractory", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Targeted therapies", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "chronic-lymphocytic-leukemia",
    name: "Chronic Lymphocytic Leukemia (CLL)",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest", "neck"],
    overview: "Slow-growing leukemia affecting B lymphocytes.",
    symptoms: ["Often asymptomatic", "Fatigue", "Swollen lymph nodes", "Infections"],
    untreatedRisks: ["Progression", "Infections"],
    severity: [
      { stage: 1, label: "Early Stage", description: "No symptoms, watchful waiting.", treatment: ["Observation", "Regular monitoring", "May not need treatment", "Monitor for progression", "Hematology care"] },
      { stage: 2, label: "Symptomatic", description: "Symptoms or progression.", treatment: ["Chemotherapy (FCR, BR)", "Targeted therapy (ibrutinib, venetoclax)", "Monoclonal antibodies (rituximab)", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Advanced", description: "Refractory or transformed.", treatment: ["Alternate targeted therapies", "Stem cell transplant", "CAR-T cell therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "chronic-myeloid-leukemia",
    name: "Chronic Myeloid Leukemia (CML)",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest"],
    overview: "Leukemia with Philadelphia chromosome, treatable with targeted therapy.",
    symptoms: ["Fatigue", "Abdominal fullness", "Weight loss", "Sweating"],
    untreatedRisks: ["Blast crisis", "Death"],
    severity: [
      { stage: 1, label: "Chronic Phase", description: "Controlled disease.", treatment: ["Tyrosine kinase inhibitors (imatinib, dasatinib, nilotinib)", "Regular monitoring", "Excellent prognosis", "Lifelong treatment", "Hematology-oncology care"] },
      { stage: 2, label: "Accelerated Phase", description: "Disease progression.", treatment: ["Higher dose TKI", "Stem cell transplant consideration", "Regular monitoring", "Manage complications", "Specialist care"] },
      { stage: 3, label: "Blast Crisis", description: "Acute transformation.", treatment: ["Intensive chemotherapy", "Stem cell transplant", "TKI therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "breast-cancer",
    name: "Breast Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["chest"],
    overview: "Malignant tumor in breast tissue.",
    symptoms: ["Breast lump", "Breast changes", "Nipple discharge", "Skin changes"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no lymph node spread.", treatment: ["Surgery (lumpectomy or mastectomy)", "Radiation therapy", "Hormone therapy if hormone-positive", "Regular follow-up", "Oncology care"] },
      { stage: 2, label: "Regional", description: "Spread to nearby lymph nodes.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Hormone or targeted therapy", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic therapy (chemotherapy, targeted, immunotherapy)", "Palliative care", "Symptom management", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 40,
  },

  {
    id: "triple-negative-breast-cancer",
    name: "Triple-Negative Breast Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["chest"],
    overview: "Aggressive breast cancer lacking hormone receptors and HER2.",
    symptoms: ["Breast lump", "Rapid growth", "Skin changes", "Lymph node involvement"],
    untreatedRisks: ["Rapid metastasis", "Poor prognosis"],
    severity: [
      { stage: 1, label: "Early", description: "Localized, no lymph nodes.", treatment: ["Surgery", "Chemotherapy (neoadjuvant or adjuvant)", "Radiation", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Lymph node involvement.", treatment: ["Neoadjuvant chemotherapy", "Surgery", "Radiation", "Consider immunotherapy", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Distant spread.", treatment: ["Chemotherapy", "Immunotherapy (atezolizumab, pembrolizumab)", "PARP inhibitors if BRCA+", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 40,
  },

  {
    id: "her2-positive-breast-cancer",
    name: "HER2-Positive Breast Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["chest"],
    overview: "Breast cancer with HER2 protein overexpression, treatable with targeted therapy.",
    symptoms: ["Breast lump", "Rapid growth", "Lymph node involvement"],
    untreatedRisks: ["Aggressive growth", "Metastasis"],
    severity: [
      { stage: 1, label: "Early", description: "Small, localized.", treatment: ["Surgery", "HER2-targeted therapy (trastuzumab, pertuzumab)", "Chemotherapy", "Radiation", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Lymph node involvement.", treatment: ["Neoadjuvant HER2-targeted therapy", "Surgery", "Adjuvant therapy", "Radiation", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Distant spread.", treatment: ["HER2-targeted therapy (trastuzumab, T-DM1, tucatinib)", "Chemotherapy", "Clinical trials", "Palliative care", "Supportive care"] },
    ],

    earlyDetectionAge: 40,
  },

  {
    id: "lung-cancer",
    name: "Lung Cancer",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Malignant tumor in the lungs, often related to smoking.",
    symptoms: ["Persistent cough", "Chest pain", "Shortness of breath", "Weight loss"],
    untreatedRisks: ["Metastasis", "Respiratory failure", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Localized tumor.", treatment: ["Surgery (lobectomy)", "Radiation therapy", "Regular follow-up", "Smoking cessation", "Oncology care"] },
      { stage: 2, label: "Regional", description: "Spread to nearby lymph nodes.", treatment: ["Surgery plus chemotherapy", "Radiation", "Targeted therapy if mutations present", "Immunotherapy", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic therapy (chemotherapy, targeted, immunotherapy)", "Palliative care", "Symptom management", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "non-small-cell-lung-cancer",
    name: "Non-Small Cell Lung Cancer (NSCLC)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Most common type of lung cancer, includes adenocarcinoma, squamous cell, and large cell.",
    symptoms: ["Persistent cough", "Chest pain", "Shortness of breath", "Weight loss"],
    untreatedRisks: ["Metastasis", "Respiratory failure", "Death"],
    severity: [
      { stage: 1, label: "Stage I-II", description: "Localized or regional.", treatment: ["Surgery", "Adjuvant chemotherapy if high risk", "Radiation if not surgical candidate", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Stage III", description: "Locally advanced.", treatment: ["Chemoradiation", "Surgery if resectable", "Immunotherapy consolidation", "Targeted therapy if mutations", "Multidisciplinary team"] },
      { stage: 3, label: "Stage IV", description: "Metastatic.", treatment: ["Targeted therapy if driver mutations (EGFR, ALK, ROS1, etc.)", "Immunotherapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "small-cell-lung-cancer",
    name: "Small Cell Lung Cancer (SCLC)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Aggressive lung cancer, often spreads early, strongly linked to smoking.",
    symptoms: ["Persistent cough", "Chest pain", "Shortness of breath", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Limited Stage", description: "Confined to one lung and nearby lymph nodes.", treatment: ["Chemoradiation", "Prophylactic cranial irradiation", "Regular monitoring", "High response rates", "Oncology care"] },
      { stage: 2, label: "Extensive Stage", description: "Spread beyond one lung.", treatment: ["Chemotherapy (etoposide/cisplatin)", "Immunotherapy (atezolizumab, durvalumab)", "Radiation for symptoms", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Second-line chemotherapy (topotecan)", "Clinical trials", "Palliative care", "Symptom management", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "colorectal-cancer",
    name: "Colorectal Cancer",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Cancer of the colon or rectum, often starting as polyps.",
    symptoms: ["Blood in stool", "Change in bowel habits", "Abdominal pain", "Unexplained weight loss"],
    untreatedRisks: ["Metastasis", "Bowel obstruction", "Death"],
    severity: [
      { stage: 1, label: "Stage I", description: "Cancer in inner layers of colon/rectum.", treatment: ["Surgery (colectomy or proctectomy)", "May not need chemotherapy", "Regular follow-up", "Colonoscopy surveillance", "Oncology care"] },
      { stage: 2, label: "Stage II-III", description: "Spread to nearby tissues or lymph nodes.", treatment: ["Surgery", "Adjuvant chemotherapy (FOLFOX, CAPOX)", "Radiation for rectal cancer", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Stage IV", description: "Metastatic disease.", treatment: ["Systemic chemotherapy", "Targeted therapy (bevacizumab, cetuximab)", "Immunotherapy if MSI-high", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 45,
  },

  {
    id: "prostate-cancer",
    name: "Prostate Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the prostate gland in men.",
    symptoms: ["Often asymptomatic early", "Urinary problems", "Blood in semen", "Erectile dysfunction"],
    untreatedRisks: ["Metastasis", "Bone pain", "Death"],
    severity: [
      { stage: 1, label: "Low Risk", description: "PSA <10, Gleason ≤6, localized.", treatment: ["Active surveillance", "Radical prostatectomy", "Radiation therapy", "Regular PSA monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Intermediate/High Risk", description: "Higher PSA or Gleason score, may have spread.", treatment: ["Radical prostatectomy", "Radiation therapy", "Hormone therapy (androgen deprivation)", "Combination therapy", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to bones or other organs.", treatment: ["Hormone therapy", "Chemotherapy (docetaxel)", "Targeted therapy (abiraterone, enzalutamide)", "Radiation for bone metastases", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "pancreatic-cancer",
    name: "Pancreatic Cancer",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen", "back"],
    overview: "Aggressive cancer of the pancreas, often diagnosed late.",
    symptoms: ["Abdominal pain", "Jaundice", "Weight loss", "Loss of appetite"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Tumor can be surgically removed.", treatment: ["Whipple procedure (pancreaticoduodenectomy)", "Adjuvant chemotherapy (gemcitabine, FOLFIRINOX)", "Regular monitoring", "Nutritional support", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Tumor involves nearby vessels, not resectable.", treatment: ["Neoadjuvant chemotherapy", "Radiation therapy", "Consider surgery if responds", "Palliative care", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (FOLFIRINOX, gemcitabine/nab-paclitaxel)", "Palliative care", "Pain management", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "liver-cancer",
    name: "Liver Cancer (Hepatocellular Carcinoma)",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Primary cancer of the liver, often associated with cirrhosis or hepatitis.",
    symptoms: ["Abdominal pain", "Weight loss", "Jaundice", "Fatigue"],
    untreatedRisks: ["Liver failure", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Single small tumor, good liver function.", treatment: ["Surgical resection", "Liver transplant if eligible", "Ablation therapy", "Regular monitoring", "Hepatology/oncology care"] },
      { stage: 2, label: "Intermediate", description: "Multiple tumors or larger single tumor.", treatment: ["Transarterial chemoembolization (TACE)", "Radioembolization", "Targeted therapy (sorafenib, lenvatinib)", "Consider transplant", "Multidisciplinary care"] },
      { stage: 3, label: "Advanced", description: "Vascular invasion or metastasis.", treatment: ["Systemic therapy (sorafenib, lenvatinib, atezolizumab/bevacizumab)", "Palliative care", "Pain management", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "ovarian-cancer",
    name: "Ovarian Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis", "abdomen"],
    overview: "Cancer of the ovaries, often diagnosed at advanced stages.",
    symptoms: ["Abdominal bloating", "Pelvic pain", "Feeling full quickly", "Urinary urgency"],
    untreatedRisks: ["Metastasis", "Bowel obstruction", "Death"],
    severity: [
      { stage: 1, label: "Stage I", description: "Cancer confined to ovaries.", treatment: ["Surgery (hysterectomy, bilateral salpingo-oophorectomy)", "May not need chemotherapy", "Regular follow-up", "Genetic testing", "Gynecologic oncology care"] },
      { stage: 2, label: "Stage II-III", description: "Spread to pelvis or abdomen.", treatment: ["Debulking surgery", "Chemotherapy (carboplatin, paclitaxel)", "Targeted therapy (bevacizumab)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Stage IV", description: "Metastatic disease.", treatment: ["Chemotherapy", "PARP inhibitors if BRCA mutation", "Palliative care", "Symptom management", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cervical-cancer",
    name: "Cervical Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the cervix, often related to HPV infection.",
    symptoms: ["Abnormal vaginal bleeding", "Pelvic pain", "Pain during intercourse", "Unusual discharge"],
    untreatedRisks: ["Metastasis", "Kidney failure", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Cancer confined to cervix.", treatment: ["Surgery (cone biopsy, hysterectomy)", "Radiation therapy", "Regular follow-up", "HPV vaccination for prevention", "Gynecologic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread beyond cervix but not distant.", treatment: ["Chemoradiation", "Surgery if appropriate", "Brachytherapy", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy (pembrolizumab)", "Palliative care", "Symptom management", "Clinical trials"] },
    ],

    earlyDetectionAge: 21,
  },

  {
    id: "thyroid-cancer",
    name: "Thyroid Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Cancer of the thyroid gland, usually has good prognosis.",
    symptoms: ["Thyroid nodule", "Hoarseness", "Difficulty swallowing", "Neck swelling"],
    untreatedRisks: ["Spread to lymph nodes", "Recurrence"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Small tumor, no spread.", treatment: ["Thyroidectomy", "May not need radioactive iodine", "Thyroid hormone replacement", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Intermediate Risk", description: "Larger tumor or lymph node involvement.", treatment: ["Total thyroidectomy", "Radioactive iodine ablation", "Thyroid hormone suppression", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "High Risk", description: "Distant metastasis or aggressive type.", treatment: ["Surgery and radioactive iodine", "External beam radiation", "Targeted therapy (sorafenib, lenvatinib)", "Regular monitoring", "Specialist care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "bladder-cancer",
    name: "Bladder Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the bladder lining, often related to smoking.",
    symptoms: ["Blood in urine", "Frequent urination", "Painful urination", "Pelvic pain"],
    untreatedRisks: ["Muscle invasion", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Non-Muscle Invasive", description: "Cancer in inner layers only.", treatment: ["Transurethral resection (TURBT)", "Intravesical BCG or chemotherapy", "Regular cystoscopy", "Smoking cessation", "Urology care"] },
      { stage: 2, label: "Muscle Invasive", description: "Cancer invades muscle layer.", treatment: ["Radical cystectomy", "Neoadjuvant chemotherapy", "Bladder reconstruction or diversion", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy (pembrolizumab, atezolizumab)", "Palliative care", "Symptom management", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "kidney-cancer",
    name: "Kidney Cancer (Renal Cell Carcinoma)",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Cancer of the kidney, often discovered incidentally.",
    symptoms: ["Blood in urine", "Flank pain", "Abdominal mass", "Fatigue"],
    untreatedRisks: ["Metastasis", "Kidney failure"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, confined to kidney.", treatment: ["Partial or radical nephrectomy", "May not need additional treatment", "Regular monitoring", "Preserve kidney function if possible", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or spread to nearby tissues.", treatment: ["Radical nephrectomy", "Adjuvant therapy if high risk", "Targeted therapy (sunitinib, pazopanib)", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy (sunitinib, pazopanib, cabozantinib)", "Immunotherapy (nivolumab, ipilimumab)", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "stomach-cancer",
    name: "Stomach Cancer (Gastric Cancer)",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Cancer of the stomach, often related to H. pylori infection.",
    symptoms: ["Abdominal pain", "Nausea", "Loss of appetite", "Weight loss"],
    untreatedRisks: ["Metastasis", "Bleeding", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Cancer in inner layers only.", treatment: ["Endoscopic resection or surgery", "May not need chemotherapy", "Regular follow-up", "H. pylori eradication", "Gastroenterology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to muscle or lymph nodes.", treatment: ["Gastrectomy", "Adjuvant chemotherapy", "Perioperative chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (FOLFOX, FLOT)", "Targeted therapy (trastuzumab if HER2+)", "Immunotherapy if MSI-high", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "esophageal-cancer",
    name: "Esophageal Cancer",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["chest"],
    overview: "Cancer of the esophagus, often related to GERD or smoking.",
    symptoms: ["Difficulty swallowing", "Chest pain", "Weight loss", "Hoarseness"],
    untreatedRisks: ["Obstruction", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Cancer in inner layers only.", treatment: ["Endoscopic resection or esophagectomy", "May not need additional treatment", "Regular follow-up", "Manage GERD", "Gastroenterology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to muscle or nearby lymph nodes.", treatment: ["Neoadjuvant chemoradiation", "Esophagectomy", "Adjuvant therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if HER2+", "Immunotherapy (pembrolizumab)", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "brain-cancer",
    name: "Brain Tumor (Glioblastoma)",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Aggressive primary brain cancer with poor prognosis.",
    symptoms: ["Headaches", "Seizures", "Neurological deficits", "Personality changes"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive tumor.", treatment: ["Surgical resection", "Radiation therapy", "May not need chemotherapy", "Regular MRI monitoring", "Neuro-oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive tumor.", treatment: ["Maximal safe resection", "Radiation therapy", "Temozolomide chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent/Refractory", description: "Tumor returns or doesn't respond.", treatment: ["Re-resection if possible", "Alternate chemotherapy", "Bevacizumab", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "lymphoma",
    name: "Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Cancer of the lymphatic system (Hodgkin or Non-Hodgkin).",
    symptoms: ["Swollen lymph nodes", "Fever", "Night sweats", "Weight loss"],
    untreatedRisks: ["Spread", "Organ involvement", "Death"],
    severity: [
      { stage: 1, label: "Early Stage", description: "Limited lymph node involvement.", treatment: ["Chemotherapy (ABVD for Hodgkin, R-CHOP for NHL)", "Radiation therapy", "High cure rates", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced Stage", description: "Widespread lymph node or organ involvement.", treatment: ["Intensive chemotherapy", "Stem cell transplant if needed", "Targeted therapy (rituximab)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "CAR-T cell therapy (for some types)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "myeloma",
    name: "Multiple Myeloma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["back", "chest"],
    overview: "Cancer of plasma cells in bone marrow.",
    symptoms: ["Bone pain", "Fatigue", "Frequent infections", "Kidney problems"],
    untreatedRisks: ["Bone fractures", "Kidney failure", "Death"],
    severity: [
      { stage: 1, label: "Smoldering", description: "No symptoms, monitor only.", treatment: ["Observation", "Regular monitoring", "May not need treatment", "Bone density monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Active", description: "Symptoms present, needs treatment.", treatment: ["Chemotherapy (bortezomib, lenalidomide)", "Stem cell transplant if eligible", "Dexamethasone", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "Relapsed/Refractory", description: "Returns after treatment.", treatment: ["Alternate chemotherapy", "CAR-T cell therapy", "Monoclonal antibodies (daratumumab)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "hodgkin-lymphoma",
    name: "Hodgkin Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck"],
    overview: "Type of lymphoma with Reed-Sternberg cells, highly curable.",
    symptoms: ["Swollen lymph nodes", "Fever", "Night sweats", "Weight loss"],
    untreatedRisks: ["Spread", "Organ involvement", "Death"],
    severity: [
      { stage: 1, label: "Early Stage", description: "Limited lymph node involvement.", treatment: ["ABVD chemotherapy", "Radiation therapy", "High cure rates (>90%)", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced Stage", description: "Widespread involvement.", treatment: ["ABVD or BEACOPP chemotherapy", "Radiation if bulky disease", "Stem cell transplant if relapsed", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Brentuximab vedotin", "PD-1 inhibitors", "Clinical trials"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "non-hodgkin-lymphoma",
    name: "Non-Hodgkin Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Diverse group of lymphomas, includes many subtypes.",
    symptoms: ["Swollen lymph nodes", "Fever", "Night sweats", "Weight loss"],
    untreatedRisks: ["Spread", "Organ involvement", "Death"],
    severity: [
      { stage: 1, label: "Early Stage", description: "Limited involvement.", treatment: ["R-CHOP chemotherapy", "Radiation for localized", "High cure rates for aggressive types", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced Stage", description: "Widespread involvement.", treatment: ["R-CHOP or other regimens", "Stem cell transplant if high risk", "Targeted therapy (rituximab)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "CAR-T cell therapy (for some types)", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "endometrial-cancer",
    name: "Endometrial Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the uterine lining, most common gynecologic cancer.",
    symptoms: ["Abnormal vaginal bleeding", "Pelvic pain", "Discharge", "Pain during intercourse"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to uterus.", treatment: ["Hysterectomy", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Gynecologic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to cervix or nearby.", treatment: ["Surgery", "Radiation therapy", "Chemotherapy if high risk", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Hormone therapy", "Immunotherapy if MSI-high", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "testicular-cancer",
    name: "Testicular Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the testicles, highly curable even when advanced.",
    symptoms: ["Testicular lump", "Testicular swelling", "Pain or discomfort", "Back pain (if advanced)"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to testicle.", treatment: ["Radical orchiectomy", "Surveillance or adjuvant chemotherapy", "High cure rates", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Regional", description: "Spread to lymph nodes.", treatment: ["Orchiectomy", "Chemotherapy (BEP)", "RPLND if residual mass", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (BEP or VIP)", "High cure rates even when advanced", "Surgery for residual disease", "Regular monitoring", "Excellent prognosis"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "sarcoma",
    name: "Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back"],
    overview: "Cancer of bone or soft tissues.",
    symptoms: ["Lump or mass", "Pain", "Swelling", "Limited movement"],
    untreatedRisks: ["Metastasis", "Local invasion", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive, localized.", treatment: ["Surgical resection", "May not need chemotherapy", "Regular monitoring", "Good prognosis", "Orthopedic/surgical oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Neoadjuvant chemotherapy", "Surgical resection", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if specific mutations", "Surgery for metastases if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "mesothelioma",
    name: "Mesothelioma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["chest", "abdomen"],
    overview: "Cancer of mesothelial cells, often related to asbestos exposure.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Localized to one side.", treatment: ["Surgery (pleurectomy/decortication or extrapleural pneumonectomy)", "Chemotherapy", "Radiation", "Multimodal therapy", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive local spread.", treatment: ["Chemotherapy (pemetrexed/cisplatin)", "Surgery if resectable", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Immunotherapy (pembrolizumab, nivolumab)", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "nasopharyngeal-cancer",
    name: "Nasopharyngeal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Cancer of the nasopharynx, often related to EBV infection.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Hearing loss", "Neck mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Localized to nasopharynx.", treatment: ["Radiation therapy", "May not need chemotherapy", "Regular follow-up", "Good prognosis", "Radiation oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby structures.", treatment: ["Chemoradiation", "Neoadjuvant chemotherapy", "Regular monitoring", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "oral-cancer",
    name: "Oral Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Cancer of the mouth, often related to tobacco and alcohol.",
    symptoms: ["Mouth sore that doesn't heal", "White or red patches", "Difficulty swallowing", "Jaw pain"],
    untreatedRisks: ["Metastasis", "Difficulty eating", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no spread.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or lymph node involvement.", treatment: ["Surgery", "Radiation therapy", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy (pembrolizumab)", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "laryngeal-cancer",
    name: "Laryngeal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["neck"],
    overview: "Cancer of the larynx (voice box), often related to smoking.",
    symptoms: ["Hoarseness", "Throat pain", "Difficulty swallowing", "Lump in neck"],
    untreatedRisks: ["Loss of voice", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no spread.", treatment: ["Radiation therapy or surgery", "Voice preservation if possible", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or lymph node involvement.", treatment: ["Chemoradiation", "Laryngectomy if needed", "Voice rehabilitation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "adrenal-cancer",
    name: "Adrenal Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen", "back"],
    overview: "Rare cancer of the adrenal gland.",
    symptoms: ["Abdominal pain", "Weight gain", "High blood pressure", "Excess hormones"],
    untreatedRisks: ["Metastasis", "Hormonal complications", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no spread.", treatment: ["Surgical resection (adrenalectomy)", "May not need additional treatment", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or local invasion.", treatment: ["Surgery", "Mitotane", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Mitotane", "Chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "neuroendocrine-tumor",
    name: "Neuroendocrine Tumor",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen", "chest"],
    overview: "Tumors arising from neuroendocrine cells, can occur in various organs.",
    symptoms: ["Varies by location", "Hormone-related symptoms", "Flushing", "Diarrhea"],
    untreatedRisks: ["Metastasis", "Hormonal complications"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Slow-growing, localized.", treatment: ["Surgical resection", "Somatostatin analogs if functional", "Regular monitoring", "Good prognosis", "Endocrinology/oncology care"] },
      { stage: 2, label: "Intermediate Grade", description: "Moderate growth rate.", treatment: ["Surgery", "Somatostatin analogs", "Peptide receptor radionuclide therapy (PRRT)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "High Grade/Metastatic", description: "Aggressive or spread.", treatment: ["Chemotherapy", "PRRT", "Targeted therapy (everolimus)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "gallbladder-cancer",
    name: "Gallbladder Cancer",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Rare cancer of the gallbladder, often discovered late.",
    symptoms: ["Abdominal pain", "Jaundice", "Nausea", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to gallbladder.", treatment: ["Cholecystectomy", "May need extended resection", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby tissues.", treatment: ["Extended surgery", "Adjuvant chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (gemcitabine/cisplatin)", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "bile-duct-cancer",
    name: "Bile Duct Cancer (Cholangiocarcinoma)",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Cancer of the bile ducts, often related to liver disease.",
    symptoms: ["Jaundice", "Abdominal pain", "Weight loss", "Itching"],
    untreatedRisks: ["Liver failure", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Hepatology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Chemotherapy", "Radiation", "Stent placement for obstruction", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (gemcitabine/cisplatin)", "Targeted therapy if FGFR2 fusion", "Immunotherapy if MSI-high", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "anal-cancer",
    name: "Anal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the anus, often related to HPV infection.",
    symptoms: ["Rectal bleeding", "Anal pain", "Itching", "Lump near anus"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no spread.", treatment: ["Chemoradiation", "High cure rates", "Surgery if doesn't respond", "Regular follow-up", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or lymph node involvement.", treatment: ["Chemoradiation", "Surgery if needed", "Regular monitoring", "Good prognosis", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "penile-cancer",
    name: "Penile Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Rare cancer of the penis, often related to HPV.",
    symptoms: ["Penile lesion", "Discharge", "Bleeding", "Pain"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to penis.", treatment: ["Surgical resection", "Circumcision if on foreskin", "Regular follow-up", "Good prognosis", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby lymph nodes.", treatment: ["Surgery", "Lymph node dissection", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Immunotherapy", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "vulvar-cancer",
    name: "Vulvar Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Cancer of the vulva, often related to HPV or lichen sclerosus.",
    symptoms: ["Vulvar itching", "Lump or sore", "Bleeding", "Pain"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to vulva.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Gynecologic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby structures.", treatment: ["Surgery", "Radiation therapy", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "vaginal-cancer",
    name: "Vaginal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Rare cancer of the vagina, often related to HPV.",
    symptoms: ["Abnormal vaginal bleeding", "Vaginal discharge", "Pelvic pain", "Painful urination"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to vagina.", treatment: ["Radiation therapy", "Surgery for small tumors", "Regular follow-up", "Good prognosis", "Gynecologic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby structures.", treatment: ["Chemoradiation", "Surgery if appropriate", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Palliative care", "Clinical trials", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "bone-cancer",
    name: "Bone Cancer (Osteosarcoma)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back"],
    overview: "Primary cancer of bone, most common in children and young adults.",
    symptoms: ["Bone pain", "Swelling", "Fracture", "Limited movement"],
    untreatedRisks: ["Metastasis", "Amputation", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to bone.", treatment: ["Neoadjuvant chemotherapy", "Surgical resection", "Limb-sparing surgery if possible", "Regular monitoring", "Orthopedic oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive, still localized.", treatment: ["Intensive chemotherapy", "Surgical resection", "May need amputation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs or other bones.", treatment: ["Intensive chemotherapy", "Surgery for primary and metastases", "Clinical trials", "Palliative care", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "ewing-sarcoma",
    name: "Ewing Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back", "chest"],
    overview: "Aggressive bone or soft tissue cancer, most common in children.",
    symptoms: ["Bone pain", "Swelling", "Fever", "Fatigue"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Intensive chemotherapy", "Surgical resection", "Radiation if not resectable", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Large tumor or nearby spread.", treatment: ["Intensive chemotherapy", "Surgery and/or radiation", "Stem cell transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "chondrosarcoma",
    name: "Chondrosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back", "chest"],
    overview: "Bone cancer arising from cartilage, usually in adults.",
    symptoms: ["Bone pain", "Swelling", "Fracture", "Limited movement"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Slow-growing, localized.", treatment: ["Surgical resection", "May not need chemotherapy", "Regular monitoring", "Good prognosis", "Orthopedic oncology care"] },
      { stage: 2, label: "Intermediate Grade", description: "Moderate growth rate.", treatment: ["Wide surgical resection", "May need chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "High Grade/Metastatic", description: "Aggressive or spread.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "kaposi-sarcoma",
    name: "Kaposi Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin", "chest", "abdomen"],
    overview: "Cancer causing skin lesions, often related to HHV-8 or HIV.",
    symptoms: ["Purple skin lesions", "Swollen lymph nodes", "Gastrointestinal bleeding", "Shortness of breath"],
    untreatedRisks: ["Organ involvement", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Skin lesions only.", treatment: ["Local therapy (surgery, radiation)", "Antiretroviral therapy if HIV+", "Regular monitoring", "Good prognosis", "Dermatology/oncology care"] },
      { stage: 2, label: "Widespread", description: "Multiple sites or organ involvement.", treatment: ["Systemic chemotherapy", "Antiretroviral therapy if HIV+", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Visceral", description: "Internal organ involvement.", treatment: ["Systemic chemotherapy", "Antiretroviral therapy if HIV+", "Supportive care", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "gastrointestinal-stromal-tumor",
    name: "Gastrointestinal Stromal Tumor (GIST)",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Tumor of the GI tract, often treatable with targeted therapy.",
    symptoms: ["Abdominal pain", "Bleeding", "Feeling full", "Nausea"],
    untreatedRisks: ["Metastasis", "Bleeding"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Small tumor, low mitotic rate.", treatment: ["Surgical resection", "May not need imatinib", "Regular monitoring", "Good prognosis", "Surgical oncology care"] },
      { stage: 2, label: "Intermediate/High Risk", description: "Larger or higher mitotic rate.", treatment: ["Surgical resection", "Adjuvant imatinib", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Imatinib or other TKIs (sunitinib, regorafenib)", "Surgery for metastases if possible", "Regular monitoring", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "carcinoid-tumor",
    name: "Carcinoid Tumor",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen", "chest"],
    overview: "Slow-growing neuroendocrine tumor, often in GI tract or lungs.",
    symptoms: ["Flushing", "Diarrhea", "Wheezing", "Heart problems"],
    untreatedRisks: ["Carcinoid syndrome", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Endocrinology/oncology care"] },
      { stage: 2, label: "Regional", description: "Spread to nearby lymph nodes.", treatment: ["Surgery", "Somatostatin analogs", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Somatostatin analogs", "Peptide receptor radionuclide therapy (PRRT)", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "thymoma",
    name: "Thymoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["chest"],
    overview: "Tumor of the thymus gland, often associated with myasthenia gravis.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Muscle weakness"],
    untreatedRisks: ["Metastasis", "Myasthenia gravis"],
    severity: [
      { stage: 1, label: "Encapsulated", description: "Confined to thymus.", treatment: ["Surgical resection", "High cure rates", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Invasive", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation therapy", "Chemotherapy if advanced", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Radiation", "Surgery if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "merkel-cell-carcinoma",
    name: "Merkel Cell Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin"],
    overview: "Aggressive skin cancer, often related to Merkel cell polyomavirus.",
    symptoms: ["Rapidly growing skin nodule", "Red or purple color", "Painless", "May ulcerate"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Localized to skin.", treatment: ["Wide local excision", "Sentinel lymph node biopsy", "Radiation therapy", "Regular monitoring", "Dermatology/oncology care"] },
      { stage: 2, label: "Regional", description: "Spread to lymph nodes.", treatment: ["Surgery", "Lymph node dissection", "Radiation", "Chemotherapy", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Immunotherapy (avelumab, pembrolizumab)", "Chemotherapy", "Clinical trials", "Palliative care", "Supportive care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "sebaceous-carcinoma",
    name: "Sebaceous Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin", "head"],
    overview: "Rare aggressive skin cancer of sebaceous glands.",
    symptoms: ["Yellowish nodule", "Often on eyelid", "May ulcerate", "Rapid growth"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgical excision", "Mohs surgery if on face", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Regional", description: "Spread to lymph nodes.", treatment: ["Surgery", "Lymph node dissection", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Radiation", "Clinical trials", "Palliative care", "Supportive care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "dermatofibrosarcoma-protuberans",
    name: "Dermatofibrosarcoma Protuberans",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin"],
    overview: "Rare skin cancer, locally aggressive but rarely metastasizes.",
    symptoms: ["Firm skin nodule", "Slow growth", "May be purple", "Often on trunk"],
    untreatedRisks: ["Local recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to skin.", treatment: ["Wide local excision", "Mohs surgery", "Regular monitoring", "Good prognosis", "Dermatology/oncology care"] },
      { stage: 2, label: "Recurrent", description: "Returns after surgery.", treatment: ["Re-excision", "May need imatinib", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread to distant organs.", treatment: ["Imatinib", "Surgery if possible", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "acute-promyelocytic-leukemia",
    name: "Acute Promyelocytic Leukemia (APL)",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest"],
    overview: "Subtype of AML with specific genetic abnormality, highly curable.",
    symptoms: ["Bleeding", "Bruising", "Fatigue", "Fever"],
    untreatedRisks: ["Severe bleeding", "Death"],
    severity: [
      { stage: 1, label: "Newly Diagnosed", description: "Recent diagnosis.", treatment: ["ATRA (all-trans retinoic acid)", "Arsenic trioxide", "High cure rates (>90%)", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Consolidation", description: "After induction.", treatment: ["ATRA and arsenic trioxide", "May not need chemotherapy", "Regular monitoring", "Excellent prognosis"] },
      { stage: 3, label: "Relapsed", description: "Returns after treatment.", treatment: ["ATRA and arsenic trioxide", "Stem cell transplant consideration", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "hairy-cell-leukemia",
    name: "Hairy Cell Leukemia",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest", "abdomen"],
    overview: "Rare, slow-growing leukemia with characteristic 'hairy' cells.",
    symptoms: ["Fatigue", "Enlarged spleen", "Infections", "Bleeding"],
    untreatedRisks: ["Infections", "Bleeding"],
    severity: [
      { stage: 1, label: "Asymptomatic", description: "No symptoms, watchful waiting.", treatment: ["Observation", "Regular monitoring", "May not need treatment", "Monitor blood counts"] },
      { stage: 2, label: "Symptomatic", description: "Symptoms present.", treatment: ["Cladribine or pentostatin", "High response rates", "Rituximab if relapsed", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Refractory", description: "Doesn't respond to treatment.", treatment: ["Alternate chemotherapy", "Rituximab", "BRAF inhibitors if BRAF mutation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "myelodysplastic-syndromes",
    name: "Myelodysplastic Syndromes (MDS)",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest"],
    overview: "Bone marrow disorders that can progress to leukemia.",
    symptoms: ["Fatigue", "Infections", "Bleeding", "Anemia"],
    untreatedRisks: ["Progression to AML", "Infections", "Bleeding"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Lower risk of progression.", treatment: ["Supportive care (transfusions)", "Erythropoietin", "Lenalidomide if del(5q)", "Regular monitoring", "Hematology care"] },
      { stage: 2, label: "Intermediate/High Risk", description: "Higher risk of progression.", treatment: ["Azacitidine or decitabine", "Stem cell transplant if eligible", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Transformed to AML", description: "Progressed to acute leukemia.", treatment: ["AML-type chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 60,
  },

  {
    id: "myeloproliferative-neoplasms",
    name: "Myeloproliferative Neoplasms",
    category: "Oncology",
    systems: ["Hematologic"],
    regions: ["chest"],
    overview: "Group of disorders causing overproduction of blood cells.",
    symptoms: ["Fatigue", "Headaches", "Itching", "Bleeding"],
    untreatedRisks: ["Blood clots", "Progression", "Leukemia"],
    severity: [
      { stage: 1, label: "Controlled", description: "Well-controlled with medication.", treatment: ["Hydroxyurea or interferon", "Aspirin", "Phlebotomy if polycythemia", "Regular monitoring", "Hematology care"] },
      { stage: 2, label: "Progressive", description: "Disease progression.", treatment: ["JAK inhibitors (ruxolitinib)", "Stem cell transplant consideration", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Blast Phase", description: "Transformed to acute leukemia.", treatment: ["AML-type chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "burkitt-lymphoma",
    name: "Burkitt Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Aggressive B-cell lymphoma, often curable with intensive chemotherapy.",
    symptoms: ["Rapidly growing mass", "Fever", "Night sweats", "Weight loss"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Limited involvement.", treatment: ["Intensive chemotherapy (R-CODOX-M/IVAC)", "High cure rates", "CNS prophylaxis", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced", description: "Widespread involvement.", treatment: ["Intensive chemotherapy", "CNS prophylaxis", "Regular monitoring", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "CAR-T cell therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "mantle-cell-lymphoma",
    name: "Mantle Cell Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Aggressive B-cell lymphoma with characteristic genetic abnormality.",
    symptoms: ["Swollen lymph nodes", "Fatigue", "Fever", "Weight loss"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Indolent", description: "Slow-growing variant.", treatment: ["Watchful waiting or rituximab", "Regular monitoring", "May not need aggressive treatment"] },
      { stage: 2, label: "Aggressive", description: "Rapid growth.", treatment: ["R-CHOP or R-HyperCVAD", "Stem cell transplant", "BTK inhibitors (ibrutinib)", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["BTK inhibitors", "CAR-T cell therapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "follicular-lymphoma",
    name: "Follicular Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Slow-growing B-cell lymphoma, often indolent.",
    symptoms: ["Swollen lymph nodes", "Fatigue", "Often asymptomatic"],
    untreatedRisks: ["Progression", "Transformation"],
    severity: [
      { stage: 1, label: "Grade 1-2", description: "Low-grade, indolent.", treatment: ["Watchful waiting", "Rituximab if symptomatic", "Regular monitoring", "Good prognosis", "Hematology care"] },
      { stage: 2, label: "Grade 3", description: "More aggressive.", treatment: ["R-CHOP chemotherapy", "Radiation for localized", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Transformed/Refractory", description: "Transformed or doesn't respond.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "CAR-T cell therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "marginal-zone-lymphoma",
    name: "Marginal Zone Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Slow-growing B-cell lymphoma, includes MALT lymphoma.",
    symptoms: ["Swollen lymph nodes", "Fatigue", "Often asymptomatic"],
    untreatedRisks: ["Progression", "Transformation"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to one area.", treatment: ["Radiation for localized", "Antibiotics if H. pylori-related MALT", "Regular monitoring", "Good prognosis"] },
      { stage: 2, label: "Advanced", description: "Widespread involvement.", treatment: ["Rituximab with or without chemotherapy", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Alternate chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "diffuse-large-b-cell-lymphoma",
    name: "Diffuse Large B-Cell Lymphoma (DLBCL)",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Most common type of non-Hodgkin lymphoma, aggressive but curable.",
    symptoms: ["Rapidly growing mass", "Fever", "Night sweats", "Weight loss"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Early Stage", description: "Limited involvement.", treatment: ["R-CHOP chemotherapy", "Radiation for localized", "High cure rates", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced Stage", description: "Widespread involvement.", treatment: ["R-CHOP chemotherapy", "May add etoposide for young patients", "Regular monitoring", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "CAR-T cell therapy (axicabtagene, tisagenlecleucel)", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "t-cell-lymphoma",
    name: "T-Cell Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen", "skin"],
    overview: "Lymphoma of T-cells, includes many subtypes.",
    symptoms: ["Swollen lymph nodes", "Skin lesions", "Fever", "Weight loss"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Early Stage", description: "Limited involvement.", treatment: ["CHOP chemotherapy", "Radiation for localized", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Advanced Stage", description: "Widespread involvement.", treatment: ["CHOP or other regimens", "Stem cell transplant", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "anaplastic-large-cell-lymphoma",
    name: "Anaplastic Large Cell Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen", "skin"],
    overview: "T-cell lymphoma, often ALK-positive with good prognosis.",
    symptoms: ["Swollen lymph nodes", "Skin lesions", "Fever", "Weight loss"],
    untreatedRisks: ["Progression", "Death"],
    severity: [
      { stage: 1, label: "ALK-Positive", description: "Has ALK gene rearrangement.", treatment: ["CHOP chemotherapy", "ALK inhibitors if relapsed", "High cure rates", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "ALK-Negative", description: "No ALK rearrangement.", treatment: ["CHOP chemotherapy", "Stem cell transplant", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["ALK inhibitors if ALK+", "Salvage chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cutaneous-t-cell-lymphoma",
    name: "Cutaneous T-Cell Lymphoma (Mycosis Fungoides)",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["skin"],
    overview: "T-cell lymphoma primarily affecting the skin.",
    symptoms: ["Skin rash", "Itching", "Plaques", "Tumors"],
    untreatedRisks: ["Progression", "Organ involvement"],
    severity: [
      { stage: 1, label: "Early Stage", description: "Limited skin involvement.", treatment: ["Topical treatments (steroids, nitrogen mustard)", "Phototherapy (PUVA, UVB)", "Regular monitoring", "Good prognosis", "Dermatology/oncology care"] },
      { stage: 2, label: "Advanced Stage", description: "Extensive skin or lymph node involvement.", treatment: ["Systemic therapy (methotrexate, bexarotene)", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Visceral", description: "Internal organ involvement.", treatment: ["Chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "angioimmunoblastic-t-cell-lymphoma",
    name: "Angioimmunoblastic T-Cell Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Aggressive T-cell lymphoma with characteristic features.",
    symptoms: ["Swollen lymph nodes", "Rash", "Fever", "Weight loss"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Limited involvement.", treatment: ["CHOP chemotherapy", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced", description: "Widespread involvement.", treatment: ["CHOP or other regimens", "Stem cell transplant", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "adult-t-cell-leukemia-lymphoma",
    name: "Adult T-Cell Leukemia/Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen", "skin"],
    overview: "Aggressive T-cell malignancy caused by HTLV-1 virus.",
    symptoms: ["Swollen lymph nodes", "Skin lesions", "Hypercalcemia", "Bone lesions"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Smoldering", description: "Slow-growing variant.", treatment: ["Watchful waiting", "Regular monitoring", "May not need treatment"] },
      { stage: 2, label: "Chronic", description: "More active but not acute.", treatment: ["Interferon and zidovudine", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Acute", description: "Aggressive form.", treatment: ["Intensive chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "primary-cns-lymphoma",
    name: "Primary CNS Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Lymphoma confined to the central nervous system.",
    symptoms: ["Headaches", "Seizures", "Neurological deficits", "Personality changes"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Single lesion.", treatment: ["High-dose methotrexate", "Whole brain radiation", "Regular monitoring", "Neuro-oncology care"] },
      { stage: 2, label: "Multifocal", description: "Multiple lesions.", treatment: ["High-dose methotrexate", "Rituximab", "Whole brain radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Alternate chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "mediastinal-large-b-cell-lymphoma",
    name: "Primary Mediastinal Large B-Cell Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest"],
    overview: "Aggressive B-cell lymphoma in the mediastinum, common in young adults.",
    symptoms: ["Chest pain", "Shortness of breath", "Superior vena cava syndrome", "Cough"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to mediastinum.", treatment: ["DA-EPOCH-R chemotherapy", "Radiation if bulky", "High cure rates", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Advanced", description: "Spread beyond mediastinum.", treatment: ["DA-EPOCH-R chemotherapy", "Radiation", "Regular monitoring", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "CAR-T cell therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "waldenstrom-macroglobulinemia",
    name: "Waldenström Macroglobulinemia",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["chest", "neck", "abdomen"],
    overview: "Slow-growing B-cell lymphoma with high IgM levels.",
    symptoms: ["Fatigue", "Bleeding", "Vision problems", "Neuropathy"],
    untreatedRisks: ["Hyperviscosity", "Progression"],
    severity: [
      { stage: 1, label: "Asymptomatic", description: "No symptoms, watchful waiting.", treatment: ["Observation", "Regular monitoring", "May not need treatment"] },
      { stage: 2, label: "Symptomatic", description: "Symptoms present.", treatment: ["Rituximab with chemotherapy", "BTK inhibitors (ibrutinib)", "Plasmapheresis if hyperviscosity", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Alternate chemotherapy", "BTK inhibitors", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "splenic-marginal-zone-lymphoma",
    name: "Splenic Marginal Zone Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["abdomen"],
    overview: "Slow-growing B-cell lymphoma affecting the spleen.",
    symptoms: ["Enlarged spleen", "Fatigue", "Infections", "Often asymptomatic"],
    untreatedRisks: ["Progression", "Transformation"],
    severity: [
      { stage: 1, label: "Asymptomatic", description: "No symptoms, watchful waiting.", treatment: ["Observation", "Regular monitoring", "May not need treatment"] },
      { stage: 2, label: "Symptomatic", description: "Symptoms present.", treatment: ["Splenectomy or rituximab", "Regular monitoring", "Good prognosis", "Hematology-oncology care"] },
      { stage: 3, label: "Refractory/Relapsed", description: "Doesn't respond or returns.", treatment: ["Chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "medulloblastoma",
    name: "Medulloblastoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Malignant brain tumor, most common in children.",
    symptoms: ["Headaches", "Nausea/vomiting", "Balance problems", "Vision changes"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Standard Risk", description: "Complete resection, no spread.", treatment: ["Surgery", "Radiation therapy", "Chemotherapy", "High cure rates", "Pediatric neuro-oncology care"] },
      { stage: 2, label: "High Risk", description: "Incomplete resection or spread.", treatment: ["Surgery", "Higher dose radiation", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Re-resection if possible", "Alternate chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "ependymoma",
    name: "Ependymoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head", "back"],
    overview: "Brain or spinal cord tumor arising from ependymal cells.",
    symptoms: ["Headaches", "Nausea/vomiting", "Seizures", "Back pain"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Radiation therapy", "May not need chemotherapy", "Regular monitoring", "Neuro-oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Re-resection if possible", "Alternate chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "meningioma",
    name: "Meningioma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Usually benign tumor of the meninges, can be malignant.",
    symptoms: ["Headaches", "Seizures", "Neurological deficits", "Vision changes"],
    untreatedRisks: ["Neurological deterioration", "Rare malignancy"],
    severity: [
      { stage: 1, label: "Grade I", description: "Benign, slow-growing.", treatment: ["Surgical resection", "Observation if small/asymptomatic", "Regular monitoring", "Good prognosis", "Neurosurgery care"] },
      { stage: 2, label: "Grade II", description: "Atypical, more aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Grade III", description: "Malignant, aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "schwannoma",
    name: "Schwannoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head", "back"],
    overview: "Usually benign tumor of Schwann cells, can be malignant.",
    symptoms: ["Hearing loss (if acoustic)", "Balance problems", "Facial weakness", "Back pain"],
    untreatedRisks: ["Neurological deterioration", "Rare malignancy"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous.", treatment: ["Surgical resection", "Observation if small/asymptomatic", "Radiosurgery for acoustic", "Regular monitoring", "Neurosurgery care"] },
      { stage: 2, label: "Malignant", description: "Cancerous form.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pituitary-adenoma",
    name: "Pituitary Adenoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["head"],
    overview: "Usually benign tumor of the pituitary gland.",
    symptoms: ["Vision problems", "Headaches", "Hormone imbalances", "Fatigue"],
    untreatedRisks: ["Vision loss", "Hormonal complications"],
    severity: [
      { stage: 1, label: "Microadenoma", description: "Small, <10mm.", treatment: ["Medication if functional (prolactinoma)", "Observation if non-functional", "Regular monitoring", "Endocrinology care"] },
      { stage: 2, label: "Macroadenoma", description: "Large, >10mm.", treatment: ["Surgical resection (transsphenoidal)", "Radiation if not resectable", "Hormone replacement", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Malignant", description: "Rare malignant form.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "craniopharyngioma",
    name: "Craniopharyngioma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Benign but aggressive brain tumor near pituitary, common in children.",
    symptoms: ["Vision problems", "Headaches", "Growth problems", "Hormone imbalances"],
    untreatedRisks: ["Vision loss", "Hormonal complications"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Hormone replacement", "Regular monitoring", "Pediatric neuro-oncology care"] },
      { stage: 2, label: "Partially Resectable", description: "Partial removal possible.", treatment: ["Partial resection", "Radiation therapy", "Hormone replacement", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Re-resection if possible", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "astrocytoma",
    name: "Astrocytoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Brain tumor arising from astrocytes, includes glioblastoma.",
    symptoms: ["Headaches", "Seizures", "Neurological deficits", "Personality changes"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Grade I (Pilocytic)", description: "Low-grade, often in children.", treatment: ["Surgical resection", "High cure rates", "Regular monitoring", "Pediatric neuro-oncology care"] },
      { stage: 2, label: "Grade II-IV", description: "Higher grades, more aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Chemotherapy (temozolomide)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Re-resection if possible", "Alternate chemotherapy", "Bevacizumab", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "oligodendroglioma",
    name: "Oligodendroglioma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Brain tumor arising from oligodendrocytes, often 1p/19q co-deletion.",
    symptoms: ["Headaches", "Seizures", "Neurological deficits", "Personality changes"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Grade II, slower growing.", treatment: ["Surgical resection", "Observation or radiation", "Chemotherapy if needed", "Regular monitoring", "Neuro-oncology care"] },
      { stage: 2, label: "High Grade", description: "Grade III (anaplastic).", treatment: ["Surgical resection", "Radiation and chemotherapy (PCV)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Re-resection if possible", "Alternate chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pineal-tumor",
    name: "Pineal Region Tumors",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Tumors in the pineal region, includes germinomas and pineoblastomas.",
    symptoms: ["Headaches", "Vision problems", "Nausea/vomiting", "Hormone imbalances"],
    untreatedRisks: ["Neurological deterioration", "Death"],
    severity: [
      { stage: 1, label: "Germinoma", description: "Highly radiosensitive.", treatment: ["Radiation therapy", "High cure rates", "May not need surgery", "Regular monitoring", "Neuro-oncology care"] },
      { stage: 2, label: "Non-Germinomatous", description: "Other types.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Re-resection if possible", "Alternate chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "spinal-cord-tumor",
    name: "Spinal Cord Tumor",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["back"],
    overview: "Tumors of the spinal cord, can be primary or metastatic.",
    symptoms: ["Back pain", "Weakness", "Numbness", "Bowel/bladder problems"],
    untreatedRisks: ["Paralysis", "Neurological deterioration"],
    severity: [
      { stage: 1, label: "Intramedullary", description: "Within spinal cord.", treatment: ["Surgical resection", "Radiation if not resectable", "Regular monitoring", "Neurosurgery care"] },
      { stage: 2, label: "Extramedullary", description: "Outside spinal cord.", treatment: ["Surgical resection", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread from elsewhere.", treatment: ["Radiation", "Surgery if causing compression", "Systemic therapy", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "retinoblastoma",
    name: "Retinoblastoma",
    category: "Oncology",
    systems: ["Oncology", "Ophthalmologic"],
    regions: ["head"],
    overview: "Eye cancer in children, often hereditary.",
    symptoms: ["White pupil (leukocoria)", "Crossed eyes", "Vision problems", "Eye redness"],
    untreatedRisks: ["Vision loss", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Intraocular", description: "Confined to eye.", treatment: ["Laser therapy", "Cryotherapy", "Chemotherapy", "Radiation", "Pediatric oncology care"] },
      { stage: 2, label: "Extraocular", description: "Spread beyond eye.", treatment: ["Enucleation", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "uveal-melanoma",
    name: "Uveal Melanoma",
    category: "Oncology",
    systems: ["Oncology", "Ophthalmologic"],
    regions: ["head"],
    overview: "Melanoma of the eye, different from skin melanoma.",
    symptoms: ["Vision changes", "Floaters", "Eye pain", "Loss of vision"],
    untreatedRisks: ["Vision loss", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Small", description: "Small tumor.", treatment: ["Radiation therapy (plaque)", "Laser therapy", "Regular monitoring", "Ophthalmology/oncology care"] },
      { stage: 2, label: "Medium/Large", description: "Larger tumor.", treatment: ["Enucleation or radiation", "Regular monitoring", "Liver imaging for metastases", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to liver or other organs.", treatment: ["Liver-directed therapy", "Systemic therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "lacrimal-gland-tumor",
    name: "Lacrimal Gland Tumor",
    category: "Oncology",
    systems: ["Oncology", "Ophthalmologic"],
    regions: ["head"],
    overview: "Tumors of the tear gland, can be benign or malignant.",
    symptoms: ["Eye swelling", "Eye pain", "Vision problems", "Proptosis"],
    untreatedRisks: ["Vision loss", "Metastasis"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Ophthalmology care"] },
      { stage: 2, label: "Malignant", description: "Cancerous.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic therapy", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "orbital-tumor",
    name: "Orbital Tumor",
    category: "Oncology",
    systems: ["Oncology", "Ophthalmologic"],
    regions: ["head"],
    overview: "Tumors in the eye socket, various types.",
    symptoms: ["Proptosis", "Vision problems", "Eye pain", "Double vision"],
    untreatedRisks: ["Vision loss", "Metastasis"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Ophthalmology care"] },
      { stage: 2, label: "Malignant", description: "Cancerous.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread from elsewhere.", treatment: ["Systemic therapy", "Radiation", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "salivary-gland-cancer",
    name: "Salivary Gland Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Cancer of salivary glands, various subtypes.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis", "Facial nerve damage"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no spread.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or lymph node involvement.", treatment: ["Surgery", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "parathyroid-cancer",
    name: "Parathyroid Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Rare cancer of the parathyroid glands.",
    symptoms: ["High calcium", "Kidney stones", "Bone pain", "Fatigue"],
    untreatedRisks: ["Hypercalcemia", "Kidney failure", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to parathyroid.", treatment: ["Surgical resection", "Regular monitoring", "Calcium management", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Surgery for metastases if possible", "Calcium-lowering medications", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pharyngeal-cancer",
    name: "Pharyngeal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Cancer of the pharynx (throat), includes naso-, oro-, and hypopharynx.",
    symptoms: ["Sore throat", "Difficulty swallowing", "Ear pain", "Lump in neck"],
    untreatedRisks: ["Metastasis", "Difficulty eating", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Small tumor, no spread.", treatment: ["Radiation therapy or surgery", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Larger tumor or lymph node involvement.", treatment: ["Chemoradiation", "Surgery if appropriate", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy (pembrolizumab)", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-cancer",
    name: "Sinonasal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Cancer of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Vision problems"],
    untreatedRisks: ["Metastasis", "Vision loss"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Regular follow-up", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "tracheal-cancer",
    name: "Tracheal Cancer",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest", "neck"],
    overview: "Rare cancer of the windpipe.",
    symptoms: ["Cough", "Shortness of breath", "Wheezing", "Coughing up blood"],
    untreatedRisks: ["Airway obstruction", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to trachea.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery if possible", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Radiation for symptoms", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "thymic-carcinoma",
    name: "Thymic Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["chest"],
    overview: "Malignant tumor of the thymus, more aggressive than thymoma.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Superior vena cava syndrome"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not fully resectable.", treatment: ["Neoadjuvant chemotherapy", "Surgery if responds", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pleural-tumor",
    name: "Pleural Tumor",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Tumors of the pleura, often mesothelioma or metastatic.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Pleural effusion"],
    untreatedRisks: ["Respiratory failure", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to pleura.", treatment: ["Surgical resection", "Radiation", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Advanced", description: "More extensive involvement.", treatment: ["Multimodal therapy", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic therapy", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cardiac-tumor",
    name: "Cardiac Tumor",
    category: "Oncology",
    systems: ["Oncology", "Cardiovascular"],
    regions: ["chest"],
    overview: "Rare tumors of the heart, usually metastatic.",
    symptoms: ["Heart failure", "Arrhythmias", "Chest pain", "Shortness of breath"],
    untreatedRisks: ["Heart failure", "Death"],
    severity: [
      { stage: 1, label: "Primary Benign", description: "Non-cancerous primary tumor.", treatment: ["Surgical resection", "Regular monitoring", "Cardiac surgery care"] },
      { stage: 2, label: "Primary Malignant", description: "Cancerous primary tumor.", treatment: ["Surgical resection if possible", "Radiation", "Chemotherapy", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread from elsewhere.", treatment: ["Systemic therapy", "Palliative care", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pericardial-tumor",
    name: "Pericardial Tumor",
    category: "Oncology",
    systems: ["Oncology", "Cardiovascular"],
    regions: ["chest"],
    overview: "Rare tumors of the pericardium.",
    symptoms: ["Chest pain", "Shortness of breath", "Pericardial effusion", "Heart failure"],
    untreatedRisks: ["Cardiac tamponade", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to pericardium.", treatment: ["Surgical resection", "Pericardiocentesis if effusion", "Regular monitoring", "Cardiac/oncology care"] },
      { stage: 2, label: "Advanced", description: "More extensive involvement.", treatment: ["Surgery if possible", "Radiation", "Chemotherapy", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread from elsewhere.", treatment: ["Systemic therapy", "Palliative care", "Supportive care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "leiomyosarcoma",
    name: "Leiomyosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["abdomen", "l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Sarcoma arising from smooth muscle, can occur in various locations.",
    symptoms: ["Lump or mass", "Pain", "Abdominal symptoms if visceral", "Bleeding"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Surgical oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "liposarcoma",
    name: "Liposarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["abdomen", "l_arm", "r_arm", "l_leg", "r_leg", "back"],
    overview: "Sarcoma arising from fat tissue.",
    symptoms: ["Lump or mass", "Pain", "Swelling", "Limited movement"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Well-Differentiated", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Surgical oncology care"] },
      { stage: 2, label: "Dedifferentiated", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "rhabdomyosarcoma",
    name: "Rhabdomyosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck", "abdomen", "pelvis", "l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Sarcoma of skeletal muscle, most common in children.",
    symptoms: ["Lump or mass", "Pain", "Bleeding (if genitourinary)", "Proptosis (if orbital)"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Favorable Site", description: "Good prognosis locations.", treatment: ["Surgery", "Chemotherapy", "Radiation", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Unfavorable Site", description: "Poor prognosis locations.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "synovial-sarcoma",
    name: "Synovial Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Aggressive sarcoma, often near joints.",
    symptoms: ["Lump or mass", "Pain", "Swelling", "Limited movement"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Small, Low Grade", description: "Better prognosis.", treatment: ["Surgical resection", "May not need chemotherapy", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Large or High Grade", description: "Worse prognosis.", treatment: ["Neoadjuvant chemotherapy", "Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Systemic chemotherapy", "Surgery for lung metastases if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "angiosarcoma",
    name: "Angiosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["skin", "chest", "liver"],
    overview: "Aggressive sarcoma of blood vessels.",
    symptoms: ["Skin lesions", "Bruising", "Bleeding", "Abdominal pain (if liver)"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgical resection", "Radiation", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy (pazopanib)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "fibrosarcoma",
    name: "Fibrosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back"],
    overview: "Sarcoma arising from fibrous tissue.",
    symptoms: ["Lump or mass", "Pain", "Swelling", "Limited movement"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Surgical oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "malignant-fibrous-histiocytoma",
    name: "Malignant Fibrous Histiocytoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back"],
    overview: "Sarcoma, now often called undifferentiated pleomorphic sarcoma.",
    symptoms: ["Lump or mass", "Pain", "Swelling", "Limited movement"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "clear-cell-sarcoma",
    name: "Clear Cell Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Rare sarcoma, often mistaken for melanoma.",
    symptoms: ["Lump or mass", "Pain", "Often on extremities"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgical resection", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "alveolar-soft-part-sarcoma",
    name: "Alveolar Soft Part Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Rare, slow-growing sarcoma, often in young adults.",
    symptoms: ["Lump or mass", "Pain", "Often slow-growing"],
    untreatedRisks: ["Metastasis", "Often delayed"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgical resection", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs or brain.", treatment: ["Targeted therapy (TKIs)", "Surgery for metastases if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "epithelioid-sarcoma",
    name: "Epithelioid Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Rare sarcoma, often on hands and feet.",
    symptoms: ["Lump or mass", "Pain", "May ulcerate", "Often on extremities"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgical resection", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "desmoid-tumor",
    name: "Desmoid Tumor (Aggressive Fibromatosis)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["abdomen", "l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Locally aggressive tumor, doesn't metastasize but can be destructive.",
    symptoms: ["Lump or mass", "Pain", "Limited movement", "Bowel obstruction (if abdominal)"],
    untreatedRisks: ["Local invasion", "Functional impairment"],
    severity: [
      { stage: 1, label: "Stable", description: "Not growing.", treatment: ["Observation", "Regular monitoring", "May not need treatment", "Oncology care"] },
      { stage: 2, label: "Growing", description: "Active growth.", treatment: ["Surgery if resectable", "Systemic therapy (sorafenib, pazopanib)", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after surgery.", treatment: ["Systemic therapy", "Surgery if possible", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "gastrointestinal-stromal-tumor-small-intestine",
    name: "Small Intestine GIST",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "GIST of the small intestine.",
    symptoms: ["Abdominal pain", "Bleeding", "Bowel obstruction", "Nausea"],
    untreatedRisks: ["Metastasis", "Bleeding"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Small tumor, low mitotic rate.", treatment: ["Surgical resection", "May not need imatinib", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Intermediate/High Risk", description: "Larger or higher mitotic rate.", treatment: ["Surgery", "Adjuvant imatinib", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Imatinib or other TKIs", "Surgery for metastases if possible", "Regular monitoring", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "appendix-cancer",
    name: "Appendix Cancer",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Rare cancer of the appendix, includes carcinoid and adenocarcinoma.",
    symptoms: ["Appendicitis-like symptoms", "Abdominal pain", "Often found incidentally"],
    untreatedRisks: ["Metastasis", "Pseudomyxoma peritonei"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to appendix.", treatment: ["Appendectomy", "May need right hemicolectomy", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby tissues.", treatment: ["Right hemicolectomy", "Cytoreductive surgery if pseudomyxoma", "HIPEC if indicated", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Cytoreductive surgery", "HIPEC", "Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "small-intestine-adenocarcinoma",
    name: "Small Intestine Adenocarcinoma",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Rare cancer of the small intestine.",
    symptoms: ["Abdominal pain", "Bleeding", "Bowel obstruction", "Weight loss"],
    untreatedRisks: ["Metastasis", "Bowel obstruction"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to small intestine.", treatment: ["Surgical resection", "May not need chemotherapy", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby tissues.", treatment: ["Surgery", "Adjuvant chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "ampullary-cancer",
    name: "Ampullary Cancer",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Cancer of the ampulla of Vater, where bile and pancreatic ducts meet.",
    symptoms: ["Jaundice", "Abdominal pain", "Weight loss", "Itching"],
    untreatedRisks: ["Bile duct obstruction", "Metastasis"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to ampulla.", treatment: ["Whipple procedure", "Regular monitoring", "Good prognosis", "Surgical oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Whipple procedure", "Adjuvant chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "duodenal-cancer",
    name: "Duodenal Cancer",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Cancer of the duodenum (first part of small intestine).",
    symptoms: ["Abdominal pain", "Bleeding", "Nausea", "Weight loss"],
    untreatedRisks: ["Metastasis", "Bowel obstruction"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to duodenum.", treatment: ["Surgical resection", "May not need chemotherapy", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby tissues.", treatment: ["Surgery", "Adjuvant chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "peritoneal-cancer",
    name: "Peritoneal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["abdomen"],
    overview: "Cancer of the peritoneum, often metastatic from other sites.",
    symptoms: ["Abdominal pain", "Ascites", "Bowel obstruction", "Weight loss"],
    untreatedRisks: ["Bowel obstruction", "Death"],
    severity: [
      { stage: 1, label: "Primary Peritoneal", description: "Arises from peritoneum.", treatment: ["Cytoreductive surgery", "HIPEC", "Chemotherapy", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Pseudomyxoma Peritonei", description: "Mucinous tumor.", treatment: ["Cytoreductive surgery", "HIPEC", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread from elsewhere.", treatment: ["Cytoreductive surgery if possible", "HIPEC", "Systemic therapy", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "retroperitoneal-sarcoma",
    name: "Retroperitoneal Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["abdomen", "back"],
    overview: "Sarcoma in the retroperitoneum (behind abdominal cavity).",
    symptoms: ["Abdominal pain", "Back pain", "Abdominal mass", "Weight loss"],
    untreatedRisks: ["Metastasis", "Local recurrence"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "May need organ resection", "Regular monitoring", "Surgical oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not fully resectable.", treatment: ["Neoadjuvant chemotherapy", "Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Surgery for metastases if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "adrenal-cortical-carcinoma",
    name: "Adrenal Cortical Carcinoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen", "back"],
    overview: "Rare, aggressive cancer of the adrenal cortex.",
    symptoms: ["Abdominal pain", "Hormone excess (Cushing, virilization)", "Weight gain", "High blood pressure"],
    untreatedRisks: ["Rapid metastasis", "Hormonal complications", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to adrenal.", treatment: ["Surgical resection (adrenalectomy)", "Mitotane", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Mitotane", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Mitotane", "Chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pheochromocytoma-malignant",
    name: "Malignant Pheochromocytoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen", "back"],
    overview: "Rare malignant tumor of adrenal medulla, secretes catecholamines.",
    symptoms: ["High blood pressure", "Headaches", "Sweating", "Palpitations"],
    untreatedRisks: ["Hypertensive crisis", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to adrenal.", treatment: ["Surgical resection", "Alpha-blockers preoperatively", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["MIBG therapy", "Chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "islet-cell-tumor",
    name: "Pancreatic Neuroendocrine Tumor (Islet Cell Tumor)",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen"],
    overview: "Neuroendocrine tumor of the pancreas, can be functional or non-functional.",
    symptoms: ["Varies by type", "Hypoglycemia (insulinoma)", "Ulcers (gastrinoma)", "Diarrhea (VIPoma)"],
    untreatedRisks: ["Metastasis", "Hormonal complications"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Slow-growing, localized.", treatment: ["Surgical resection", "Somatostatin analogs if functional", "Regular monitoring", "Good prognosis", "Endocrinology/oncology care"] },
      { stage: 2, label: "Intermediate Grade", description: "Moderate growth rate.", treatment: ["Surgery", "Somatostatin analogs", "PRRT", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "High Grade/Metastatic", description: "Aggressive or spread.", treatment: ["PRRT", "Chemotherapy", "Targeted therapy (everolimus, sunitinib)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "insulinoma",
    name: "Insulinoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen"],
    overview: "Pancreatic neuroendocrine tumor secreting insulin, usually benign.",
    symptoms: ["Hypoglycemia", "Confusion", "Sweating", "Seizures"],
    untreatedRisks: ["Severe hypoglycemia", "Rare malignancy"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous, most common.", treatment: ["Surgical resection", "High cure rates", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Malignant", description: "Cancerous, rare.", treatment: ["Surgery", "Somatostatin analogs", "PRRT", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["PRRT", "Chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "gastrinoma",
    name: "Gastrinoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen"],
    overview: "Neuroendocrine tumor secreting gastrin, causes Zollinger-Ellison syndrome.",
    symptoms: ["Severe ulcers", "Diarrhea", "Abdominal pain", "Reflux"],
    untreatedRisks: ["Ulcer complications", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to pancreas or duodenum.", treatment: ["Surgical resection", "PPIs", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Somatostatin analogs", "PPIs", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to liver.", treatment: ["Somatostatin analogs", "PRRT", "Liver-directed therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "glucagonoma",
    name: "Glucagonoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen"],
    overview: "Rare pancreatic neuroendocrine tumor secreting glucagon.",
    symptoms: ["Rash (necrolytic migratory erythema)", "Diabetes", "Weight loss", "Diarrhea"],
    untreatedRisks: ["Metastasis", "Skin complications"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to pancreas.", treatment: ["Surgical resection", "Somatostatin analogs", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Somatostatin analogs", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to liver.", treatment: ["Somatostatin analogs", "PRRT", "Liver-directed therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "vipoma",
    name: "VIPoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen"],
    overview: "Rare pancreatic neuroendocrine tumor secreting VIP, causes Verner-Morrison syndrome.",
    symptoms: ["Severe watery diarrhea", "Low potassium", "Dehydration", "Flushing"],
    untreatedRisks: ["Dehydration", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to pancreas.", treatment: ["Surgical resection", "Somatostatin analogs", "Fluid and electrolyte replacement", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Somatostatin analogs", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to liver.", treatment: ["Somatostatin analogs", "PRRT", "Liver-directed therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "somatostatinoma",
    name: "Somatostatinoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen"],
    overview: "Rare pancreatic or duodenal neuroendocrine tumor secreting somatostatin.",
    symptoms: ["Diabetes", "Gallstones", "Diarrhea", "Steatorrhea"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to pancreas or duodenum.", treatment: ["Surgical resection", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Somatostatin analogs", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to liver.", treatment: ["Somatostatin analogs", "PRRT", "Liver-directed therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "hepatoblastoma",
    name: "Hepatoblastoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Liver cancer in children, often curable.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Weight loss", "Jaundice"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Neoadjuvant chemotherapy", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Unresectable", description: "Not resectable initially.", treatment: ["Neoadjuvant chemotherapy", "Surgery if responds", "Liver transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Intensive chemotherapy", "Surgery for primary and metastases", "Liver transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cholangiocarcinoma-intrahepatic",
    name: "Intrahepatic Cholangiocarcinoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Bile duct cancer within the liver.",
    symptoms: ["Abdominal pain", "Weight loss", "Jaundice", "Fatigue"],
    untreatedRisks: ["Liver failure", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Hepatology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Chemotherapy", "Radiation", "Liver transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (gemcitabine/cisplatin)", "Targeted therapy if FGFR2 fusion", "Immunotherapy if MSI-high", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cholangiocarcinoma-perihilar",
    name: "Perihilar Cholangiocarcinoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Bile duct cancer at the liver hilum.",
    symptoms: ["Jaundice", "Abdominal pain", "Weight loss", "Itching"],
    untreatedRisks: ["Bile duct obstruction", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "May need liver resection", "Regular monitoring", "Hepatology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Chemotherapy", "Radiation", "Stent placement", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Targeted therapy if FGFR2 fusion", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cholangiocarcinoma-distal",
    name: "Distal Cholangiocarcinoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Bile duct cancer near the duodenum.",
    symptoms: ["Jaundice", "Abdominal pain", "Weight loss", "Itching"],
    untreatedRisks: ["Bile duct obstruction", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Whipple procedure", "Regular monitoring", "Hepatology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Chemotherapy", "Radiation", "Stent placement", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Targeted therapy if FGFR2 fusion", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "hepatocellular-carcinoma-fibrolamellar",
    name: "Fibrolamellar Hepatocellular Carcinoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Rare subtype of liver cancer in young adults without cirrhosis.",
    symptoms: ["Abdominal pain", "Abdominal mass", "Weight loss", "Fatigue"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Regular monitoring", "Better prognosis than typical HCC", "Hepatology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Neoadjuvant chemotherapy", "Surgery if responds", "Liver transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Surgery for metastases if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "intrahepatic-cholangiocarcinoma",
    name: "Intrahepatic Cholangiocarcinoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Bile duct cancer arising within the liver.",
    symptoms: ["Abdominal pain", "Weight loss", "Jaundice", "Fatigue"],
    untreatedRisks: ["Liver failure", "Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Hepatology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy (gemcitabine/cisplatin)", "Targeted therapy if FGFR2 fusion", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "renal-medullary-carcinoma",
    name: "Renal Medullary Carcinoma",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Aggressive kidney cancer in young adults with sickle cell trait.",
    symptoms: ["Blood in urine", "Flank pain", "Weight loss", "Fatigue"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to kidney.", treatment: ["Radical nephrectomy", "Chemotherapy", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "collecting-duct-carcinoma",
    name: "Collecting Duct Carcinoma",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Rare, aggressive kidney cancer.",
    symptoms: ["Blood in urine", "Flank pain", "Weight loss", "Fatigue"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to kidney.", treatment: ["Radical nephrectomy", "Chemotherapy", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "wilms-tumor",
    name: "Wilms Tumor (Nephroblastoma)",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Kidney cancer in children, highly curable.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Blood in urine", "Fever"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Favorable Histology", description: "Good prognosis type.", treatment: ["Surgery", "Chemotherapy", "May not need radiation", "High cure rates (>90%)", "Pediatric oncology care"] },
      { stage: 2, label: "Unfavorable Histology", description: "Poor prognosis type.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs or other organs.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "transitional-cell-carcinoma-upper-tract",
    name: "Upper Tract Urothelial Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["back", "abdomen"],
    overview: "Cancer of the renal pelvis or ureter.",
    symptoms: ["Blood in urine", "Flank pain", "Back pain", "Weight loss"],
    untreatedRisks: ["Metastasis", "Kidney failure"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to upper tract.", treatment: ["Nephroureterectomy", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Adjuvant chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "ureteral-cancer",
    name: "Ureteral Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["back", "abdomen"],
    overview: "Cancer of the ureter.",
    symptoms: ["Blood in urine", "Flank pain", "Back pain"],
    untreatedRisks: ["Metastasis", "Kidney obstruction"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to ureter.", treatment: ["Nephroureterectomy", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Adjuvant chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "urethral-cancer",
    name: "Urethral Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Rare cancer of the urethra.",
    symptoms: ["Blood in urine", "Difficulty urinating", "Discharge", "Lump"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to urethra.", treatment: ["Surgical resection", "Radiation", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Palliative care", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "fallopian-tube-cancer",
    name: "Fallopian Tube Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis", "abdomen"],
    overview: "Rare cancer of the fallopian tubes.",
    symptoms: ["Abdominal pain", "Vaginal bleeding", "Abdominal mass", "Ascites"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to fallopian tube.", treatment: ["Surgery (hysterectomy, bilateral salpingo-oophorectomy)", "May not need chemotherapy", "Regular monitoring", "Gynecologic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to pelvis or abdomen.", treatment: ["Debulking surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "PARP inhibitors if BRCA mutation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "primary-peritoneal-cancer",
    name: "Primary Peritoneal Cancer",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["abdomen"],
    overview: "Cancer of the peritoneum, similar to ovarian cancer.",
    symptoms: ["Abdominal bloating", "Abdominal pain", "Feeling full quickly", "Ascites"],
    untreatedRisks: ["Metastasis", "Bowel obstruction", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Limited peritoneal involvement.", treatment: ["Debulking surgery", "Chemotherapy", "Regular monitoring", "Gynecologic oncology care"] },
      { stage: 2, label: "Advanced", description: "Extensive peritoneal involvement.", treatment: ["Debulking surgery", "Chemotherapy (carboplatin, paclitaxel)", "HIPEC consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "PARP inhibitors if BRCA mutation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "gestational-trophoblastic-disease",
    name: "Gestational Trophoblastic Disease",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Tumors arising from placental tissue, highly curable.",
    symptoms: ["Vaginal bleeding", "Abnormal pregnancy symptoms", "High hCG levels", "Pelvic pain"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Good prognosis.", treatment: ["Methotrexate or dactinomycin", "High cure rates (>95%)", "Regular hCG monitoring", "Gynecologic oncology care"] },
      { stage: 2, label: "High Risk", description: "Poor prognosis.", treatment: ["Multi-agent chemotherapy (EMA-CO)", "Regular monitoring", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory", description: "Doesn't respond to treatment.", treatment: ["Alternate chemotherapy", "Surgery if needed", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "choriocarcinoma",
    name: "Choriocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Malignant form of gestational trophoblastic disease.",
    symptoms: ["Vaginal bleeding", "High hCG levels", "Metastatic symptoms", "Pelvic pain"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Good prognosis.", treatment: ["Methotrexate or dactinomycin", "High cure rates", "Regular hCG monitoring", "Gynecologic oncology care"] },
      { stage: 2, label: "High Risk", description: "Poor prognosis.", treatment: ["Multi-agent chemotherapy (EMA-CO)", "Regular monitoring", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory", description: "Doesn't respond.", treatment: ["Alternate chemotherapy", "Surgery", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "molar-pregnancy",
    name: "Molar Pregnancy",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Abnormal pregnancy that can become cancerous.",
    symptoms: ["Vaginal bleeding", "Severe nausea", "High hCG levels", "No fetal movement"],
    untreatedRisks: ["Progression to choriocarcinoma"],
    severity: [
      { stage: 1, label: "Complete Mole", description: "No fetal tissue.", treatment: ["Dilation and curettage", "hCG monitoring", "May need chemotherapy if persists", "Regular monitoring", "Gynecologic oncology care"] },
      { stage: 2, label: "Partial Mole", description: "Some fetal tissue.", treatment: ["Dilation and curettage", "hCG monitoring", "Rarely becomes cancerous", "Regular monitoring"] },
      { stage: 3, label: "Persistent/Invasive", description: "Doesn't resolve.", treatment: ["Chemotherapy (methotrexate)", "High cure rates", "Regular monitoring", "Gynecologic oncology care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sertoli-leydig-cell-tumor",
    name: "Sertoli-Leydig Cell Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Rare ovarian tumor, can secrete androgens.",
    symptoms: ["Virilization", "Irregular periods", "Abdominal mass", "Abdominal pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Well-Differentiated", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Gynecologic oncology care"] },
      { stage: 2, label: "Poorly Differentiated", description: "More aggressive.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "granulosa-cell-tumor",
    name: "Granulosa Cell Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Ovarian tumor secreting estrogen, usually low-grade.",
    symptoms: ["Irregular bleeding", "Abdominal mass", "Precocious puberty (in children)", "Abdominal pain"],
    untreatedRisks: ["Metastasis", "Often delayed"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Slow-growing.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Gynecologic oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Hormone therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "brenner-tumor",
    name: "Brenner Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Usually benign ovarian tumor, rarely malignant.",
    symptoms: ["Abdominal mass", "Often asymptomatic", "Abdominal pain"],
    untreatedRisks: ["Rare malignancy"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous, most common.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Gynecologic oncology care"] },
      { stage: 2, label: "Borderline", description: "Uncertain malignant potential.", treatment: ["Surgical resection", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Malignant", description: "Cancerous, rare.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "yolk-sac-tumor",
    name: "Yolk Sac Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Malignant germ cell tumor, most common in children.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Elevated AFP", "Precocious puberty"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to ovary or testicle.", treatment: ["Surgery", "Chemotherapy (BEP)", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby tissues.", treatment: ["Surgery", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "teratoma-malignant",
    name: "Malignant Teratoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis", "chest"],
    overview: "Malignant germ cell tumor with various tissue types.",
    symptoms: ["Mass", "Abdominal or chest pain", "Elevated tumor markers"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Mature Teratoma", description: "Usually benign.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Oncology care"] },
      { stage: 2, label: "Immature Teratoma", description: "Malignant potential.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "embryonal-carcinoma",
    name: "Embryonal Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis", "chest"],
    overview: "Malignant germ cell tumor.",
    symptoms: ["Mass", "Elevated tumor markers", "Pain"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgery", "Chemotherapy (BEP)", "High cure rates", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Spread to nearby tissues.", treatment: ["Surgery", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "seminoma",
    name: "Seminoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Type of testicular cancer, highly curable.",
    symptoms: ["Testicular lump", "Testicular swelling", "Back pain (if advanced)"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Stage I", description: "Confined to testicle.", treatment: ["Radical orchiectomy", "Surveillance or adjuvant radiation", "High cure rates", "Urology/oncology care"] },
      { stage: 2, label: "Stage II-III", description: "Spread to lymph nodes or distant.", treatment: ["Orchiectomy", "Radiation or chemotherapy", "High cure rates", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory", description: "Doesn't respond to treatment.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "non-seminoma",
    name: "Non-Seminomatous Germ Cell Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Testicular cancer including embryonal carcinoma, yolk sac, choriocarcinoma, teratoma.",
    symptoms: ["Testicular lump", "Testicular swelling", "Back pain (if advanced)", "Elevated tumor markers"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Stage I", description: "Confined to testicle.", treatment: ["Radical orchiectomy", "Surveillance or adjuvant chemotherapy", "High cure rates", "Urology/oncology care"] },
      { stage: 2, label: "Stage II-III", description: "Spread to lymph nodes or distant.", treatment: ["Orchiectomy", "Chemotherapy (BEP)", "RPLND if residual mass", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory", description: "Doesn't respond.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "choriocarcinoma-testicular",
    name: "Testicular Choriocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Rare, aggressive testicular cancer.",
    symptoms: ["Testicular lump", "Back pain", "Elevated hCG", "Gynecomastia"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to testicle.", treatment: ["Radical orchiectomy", "Chemotherapy (BEP)", "Regular monitoring", "Urology/oncology care"] },
      { stage: 2, label: "Metastatic", description: "Often spreads early.", treatment: ["Orchiectomy", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Refractory", description: "Doesn't respond.", treatment: ["Salvage chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "spermatocytic-seminoma",
    name: "Spermatocytic Seminoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["pelvis"],
    overview: "Rare, usually benign testicular tumor in older men.",
    symptoms: ["Testicular lump", "Often slow-growing"],
    untreatedRisks: ["Rare metastasis"],
    severity: [
      { stage: 1, label: "Typical", description: "Usually benign.", treatment: ["Radical orchiectomy", "Regular monitoring", "Good prognosis", "Urology care"] },
      { stage: 2, label: "With Sarcoma", description: "Malignant component.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Oncology care"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "neuroblastoma",
    name: "Neuroblastoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["abdomen", "chest", "neck", "back"],
    overview: "Cancer of nerve tissue, most common in children.",
    symptoms: ["Abdominal mass", "Bone pain", "Fever", "Proptosis"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Good prognosis factors.", treatment: ["Surgery", "May not need chemotherapy", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Intermediate Risk", description: "Moderate prognosis.", treatment: ["Surgery", "Chemotherapy", "Radiation if needed", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "High Risk", description: "Poor prognosis.", treatment: ["Intensive chemotherapy", "Surgery", "Stem cell transplant", "Immunotherapy (dinutuximab)", "Clinical trials"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "rhabdoid-tumor",
    name: "Rhabdoid Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "abdomen", "back"],
    overview: "Aggressive cancer in children, includes ATRT (atypical teratoid/rhabdoid tumor).",
    symptoms: ["Varies by location", "Headaches (if brain)", "Abdominal mass (if kidney)", "Neurological deficits"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "hepatoblastoma-fetal",
    name: "Fetal Hepatoblastoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Subtype of hepatoblastoma with fetal histology.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Weight loss", "Jaundice"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Neoadjuvant chemotherapy", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Unresectable", description: "Not resectable initially.", treatment: ["Neoadjuvant chemotherapy", "Surgery if responds", "Liver transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Intensive chemotherapy", "Surgery for primary and metastases", "Liver transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "hepatoblastoma-embryonal",
    name: "Embryonal Hepatoblastoma",
    category: "Oncology",
    systems: ["Oncology", "Hepatobiliary"],
    regions: ["abdomen"],
    overview: "Subtype of hepatoblastoma with embryonal histology, more aggressive.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Weight loss", "Jaundice"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "Neoadjuvant chemotherapy", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Unresectable", description: "Not resectable initially.", treatment: ["Neoadjuvant chemotherapy", "Surgery if responds", "Liver transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Intensive chemotherapy", "Surgery for primary and metastases", "Liver transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "wilms-tumor-favorable",
    name: "Wilms Tumor - Favorable Histology",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Wilms tumor with favorable histology, excellent prognosis.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Blood in urine", "Fever"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Stage I-II", description: "Early stages.", treatment: ["Surgery", "Chemotherapy", "May not need radiation", "High cure rates (>95%)", "Pediatric oncology care"] },
      { stage: 2, label: "Stage III-IV", description: "Advanced stages.", treatment: ["Surgery", "Chemotherapy", "Radiation", "High cure rates", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Salvage chemotherapy", "Surgery", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "wilms-tumor-unfavorable",
    name: "Wilms Tumor - Unfavorable Histology",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Wilms tumor with unfavorable histology, worse prognosis.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Blood in urine", "Fever"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Stage I-II", description: "Early stages.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Stage III-IV", description: "Advanced stages.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Salvage chemotherapy", "Surgery", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "clear-cell-sarcoma-kidney",
    name: "Clear Cell Sarcoma of Kidney",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Rare kidney cancer in children, more aggressive than Wilms tumor.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Blood in urine", "Fever"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to kidney.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to bones or lungs.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "rhabdoid-tumor-kidney",
    name: "Rhabdoid Tumor of Kidney",
    category: "Oncology",
    systems: ["Oncology", "Renal"],
    regions: ["back", "abdomen"],
    overview: "Very aggressive kidney cancer in children.",
    symptoms: ["Abdominal mass", "Abdominal pain", "Blood in urine", "Fever"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to kidney.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "osteosarcoma-pediatric",
    name: "Osteosarcoma (Pediatric)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Bone cancer most common in children and adolescents.",
    symptoms: ["Bone pain", "Swelling", "Fracture", "Limited movement"],
    untreatedRisks: ["Metastasis", "Amputation", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to bone.", treatment: ["Neoadjuvant chemotherapy", "Limb-sparing surgery", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Intensive chemotherapy", "Surgery", "May need amputation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Intensive chemotherapy", "Surgery for primary and lung metastases", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "ewing-sarcoma-pediatric",
    name: "Ewing Sarcoma (Pediatric)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg", "back", "chest"],
    overview: "Aggressive bone or soft tissue cancer in children.",
    symptoms: ["Bone pain", "Swelling", "Fever", "Fatigue"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Intensive chemotherapy", "Surgery and/or radiation", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Large tumor.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant consideration", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs or bones.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "rhabdomyosarcoma-embryonal",
    name: "Embryonal Rhabdomyosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck", "abdomen", "pelvis", "l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Subtype of rhabdomyosarcoma, better prognosis.",
    symptoms: ["Lump or mass", "Pain", "Bleeding (if genitourinary)", "Proptosis (if orbital)"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Favorable Site", description: "Good prognosis locations.", treatment: ["Surgery", "Chemotherapy", "Radiation", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Unfavorable Site", description: "Poor prognosis locations.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "rhabdomyosarcoma-alveolar",
    name: "Alveolar Rhabdomyosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["l_arm", "r_arm", "l_leg", "r_leg"],
    overview: "Subtype of rhabdomyosarcoma, worse prognosis.",
    symptoms: ["Lump or mass", "Pain", "Often on extremities"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "More extensive.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pleuropulmonary-blastoma",
    name: "Pleuropulmonary Blastoma",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung cancer in children.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Fever"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Type I", description: "Cystic, better prognosis.", treatment: ["Surgery", "May not need chemotherapy", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Type II-III", description: "Solid, worse prognosis.", treatment: ["Surgery", "Intensive chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pulmonary-blastoma",
    name: "Pulmonary Blastoma",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung cancer, can occur in children or adults.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pancreatoblastoma",
    name: "Pancreatoblastoma",
    category: "Oncology",
    systems: ["Oncology", "GI"],
    regions: ["abdomen"],
    overview: "Rare pancreatic cancer in children.",
    symptoms: ["Abdominal pain", "Abdominal mass", "Weight loss", "Jaundice"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgical resection", "May need chemotherapy", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Neoadjuvant chemotherapy", "Surgery if responds", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Surgery if possible", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "adrenocortical-carcinoma-pediatric",
    name: "Adrenocortical Carcinoma (Pediatric)",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen", "back"],
    overview: "Rare adrenal cancer in children, often functional.",
    symptoms: ["Hormone excess (virilization, Cushing)", "Abdominal mass", "Abdominal pain", "High blood pressure"],
    untreatedRisks: ["Rapid metastasis", "Hormonal complications", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to adrenal.", treatment: ["Surgical resection", "Mitotane", "Regular monitoring", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Mitotane", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Mitotane", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "pheochromocytoma-pediatric",
    name: "Pheochromocytoma (Pediatric)",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["abdomen", "back"],
    overview: "Tumor of adrenal medulla in children, usually benign but can be malignant.",
    symptoms: ["High blood pressure", "Headaches", "Sweating", "Palpitations"],
    untreatedRisks: ["Hypertensive crisis", "Rare malignancy"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous, most common.", treatment: ["Surgical resection", "Alpha-blockers preoperatively", "Regular monitoring", "Pediatric endocrinology/oncology care"] },
      { stage: 2, label: "Malignant", description: "Cancerous, rare.", treatment: ["Surgery", "MIBG therapy if needed", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["MIBG therapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "thyroid-cancer-papillary",
    name: "Papillary Thyroid Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Most common type of thyroid cancer, excellent prognosis.",
    symptoms: ["Thyroid nodule", "Hoarseness", "Difficulty swallowing", "Neck swelling"],
    untreatedRisks: ["Spread to lymph nodes", "Rare distant metastasis"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Small tumor, no spread.", treatment: ["Thyroidectomy", "May not need radioactive iodine", "Thyroid hormone replacement", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Intermediate Risk", description: "Larger tumor or lymph node involvement.", treatment: ["Total thyroidectomy", "Radioactive iodine ablation", "Thyroid hormone suppression", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "High Risk", description: "Distant metastasis or aggressive features.", treatment: ["Surgery and radioactive iodine", "External beam radiation if needed", "Targeted therapy if refractory", "Regular monitoring", "Specialist care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "thyroid-cancer-follicular",
    name: "Follicular Thyroid Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Second most common thyroid cancer, good prognosis.",
    symptoms: ["Thyroid nodule", "Hoarseness", "Difficulty swallowing", "Neck swelling"],
    untreatedRisks: ["Spread to lymph nodes", "Distant metastasis"],
    severity: [
      { stage: 1, label: "Low Risk", description: "Small tumor, no spread.", treatment: ["Thyroidectomy", "Radioactive iodine ablation", "Thyroid hormone replacement", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Intermediate Risk", description: "Larger tumor or lymph node involvement.", treatment: ["Total thyroidectomy", "Radioactive iodine ablation", "Thyroid hormone suppression", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "High Risk", description: "Distant metastasis.", treatment: ["Surgery and radioactive iodine", "External beam radiation", "Targeted therapy (sorafenib, lenvatinib)", "Regular monitoring", "Specialist care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "thyroid-cancer-medullary",
    name: "Medullary Thyroid Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Thyroid cancer arising from C-cells, can be hereditary.",
    symptoms: ["Thyroid nodule", "Hoarseness", "Difficulty swallowing", "Diarrhea (if advanced)"],
    untreatedRisks: ["Metastasis", "Hereditary forms"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to thyroid.", treatment: ["Total thyroidectomy", "Central lymph node dissection", "Regular monitoring", "Genetic testing", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Lymph node involvement.", treatment: ["Surgery", "Lateral lymph node dissection", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Surgery", "Targeted therapy (vandetanib, cabozantinib)", "Regular monitoring", "Specialist care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "thyroid-cancer-anaplastic",
    name: "Anaplastic Thyroid Cancer",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Rare, very aggressive thyroid cancer.",
    symptoms: ["Rapidly growing neck mass", "Hoarseness", "Difficulty swallowing", "Shortness of breath"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Resectable", description: "Can be surgically removed.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 2, label: "Locally Advanced", description: "Not resectable.", treatment: ["Chemoradiation", "Targeted therapy (dabrafenib/trametinib if BRAF mutation)", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "hurthle-cell-carcinoma",
    name: "Hürthle Cell Carcinoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Subtype of follicular thyroid cancer, more aggressive.",
    symptoms: ["Thyroid nodule", "Hoarseness", "Difficulty swallowing", "Neck swelling"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to thyroid.", treatment: ["Total thyroidectomy", "Radioactive iodine ablation", "Thyroid hormone suppression", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Lymph node involvement.", treatment: ["Surgery", "Radioactive iodine", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Radioactive iodine", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "insular-thyroid-carcinoma",
    name: "Insular Thyroid Carcinoma",
    category: "Oncology",
    systems: ["Oncology", "Endocrine"],
    regions: ["neck"],
    overview: "Rare, aggressive subtype of thyroid cancer.",
    symptoms: ["Thyroid nodule", "Hoarseness", "Difficulty swallowing", "Neck swelling"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to thyroid.", treatment: ["Total thyroidectomy", "Radioactive iodine ablation", "Thyroid hormone suppression", "Regular monitoring", "Endocrinology/oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Lymph node involvement.", treatment: ["Surgery", "Radioactive iodine", "Regular monitoring", "Multidisciplinary care"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Radioactive iodine", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "mucoepidermoid-carcinoma-salivary",
    name: "Mucoepidermoid Carcinoma (Salivary)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Most common malignant salivary gland tumor.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis", "Facial nerve damage"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "adenoid-cystic-carcinoma",
    name: "Adenoid Cystic Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Salivary gland cancer, slow-growing but can recur late.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Late recurrence", "Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "acinic-cell-carcinoma",
    name: "Acinic Cell Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Salivary gland cancer, usually low-grade.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "polymorphous-adenocarcinoma",
    name: "Polymorphous Adenocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Salivary gland cancer, usually low-grade.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "salivary-duct-carcinoma",
    name: "Salivary Duct Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Aggressive salivary gland cancer, similar to breast cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy (if HER2+)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "myoepithelial-carcinoma",
    name: "Myoepithelial Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "carcinoma-ex-pleomorphic-adenoma",
    name: "Carcinoma Ex Pleomorphic Adenoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Salivary gland cancer arising from benign pleomorphic adenoma.",
    symptoms: ["Lump in mouth/neck", "Rapid growth", "Facial weakness", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "basal-cell-adenocarcinoma",
    name: "Basal Cell Adenocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer, usually low-grade.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "sebaceous-adenocarcinoma",
    name: "Sebaceous Adenocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "oncocytic-carcinoma",
    name: "Oncocytic Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "epithelial-myoepithelial-carcinoma",
    name: "Epithelial-Myoepithelial Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer, usually low-grade.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "May not need additional treatment", "Regular follow-up", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "clear-cell-carcinoma-salivary",
    name: "Clear Cell Carcinoma (Salivary)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "cystadenocarcinoma",
    name: "Cystadenocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "lymphoepithelial-carcinoma",
    name: "Lymphoepithelial Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland cancer, often related to EBV.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Metastasis"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sialoblastoma",
    name: "Sialoblastoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare salivary gland tumor in infants.",
    symptoms: ["Lump in mouth/neck", "Often present at birth"],
    untreatedRisks: ["Recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Pediatric oncology care"] },
      { stage: 2, label: "Malignant", description: "Cancerous.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "small-cell-carcinoma-salivary",
    name: "Small Cell Carcinoma (Salivary)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck"],
    overview: "Rare, aggressive salivary gland cancer.",
    symptoms: ["Lump in mouth/neck", "Facial weakness", "Difficulty swallowing", "Pain"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to salivary gland.", treatment: ["Surgical resection", "Radiation therapy", "Chemotherapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "large-cell-neuroendocrine-carcinoma-lung",
    name: "Large Cell Neuroendocrine Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Aggressive type of lung cancer with neuroendocrine features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "carcinoid-tumor-lung",
    name: "Lung Carcinoid Tumor",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Slow-growing neuroendocrine tumor of the lung.",
    symptoms: ["Cough", "Chest pain", "Wheezing", "Carcinoid syndrome (if advanced)"],
    untreatedRisks: ["Metastasis", "Carcinoid syndrome"],
    severity: [
      { stage: 1, label: "Typical Carcinoid", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Thoracic oncology care"] },
      { stage: 2, label: "Atypical Carcinoid", description: "More aggressive.", treatment: ["Surgery", "May need chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Somatostatin analogs", "PRRT", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "adenosquamous-carcinoma-lung",
    name: "Adenosquamous Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung cancer with both adenocarcinoma and squamous cell features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if mutations", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "sarcomatoid-carcinoma-lung",
    name: "Sarcomatoid Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare, aggressive lung cancer with sarcomatous features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "pleomorphic-carcinoma-lung",
    name: "Pleomorphic Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung cancer with mixed histology.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "giant-cell-carcinoma-lung",
    name: "Giant Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare, aggressive lung cancer.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "basaloid-carcinoma-lung",
    name: "Basaloid Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare subtype of lung cancer.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "adenocarcinoma-in-situ-lung",
    name: "Adenocarcinoma In Situ (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Very early stage lung adenocarcinoma, highly curable.",
    symptoms: ["Often asymptomatic", "Cough", "Discovered on screening"],
    untreatedRisks: ["Progression to invasive cancer"],
    severity: [
      { stage: 1, label: "Pure AIS", description: "No invasion.", treatment: ["Surgical resection", "High cure rates (100%)", "May not need additional treatment", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Minimally Invasive", description: "Minimal invasion.", treatment: ["Surgical resection", "High cure rates", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 3, label: "Invasive", description: "Becomes invasive adenocarcinoma.", treatment: ["Surgery", "May need chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "minimally-invasive-adenocarcinoma-lung",
    name: "Minimally Invasive Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Early stage lung adenocarcinoma with minimal invasion.",
    symptoms: ["Often asymptomatic", "Cough", "Discovered on screening"],
    untreatedRisks: ["Progression"],
    severity: [
      { stage: 1, label: "MIA", description: "Minimal invasion.", treatment: ["Surgical resection", "High cure rates (>95%)", "May not need additional treatment", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "With Invasion", description: "More invasion.", treatment: ["Surgery", "May need chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Advanced", description: "Advanced disease.", treatment: ["Surgery", "Chemotherapy", "Targeted therapy if mutations", "Regular monitoring", "Multidisciplinary team"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "lepidic-adenocarcinoma-lung",
    name: "Lepidic Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung adenocarcinoma with lepidic growth pattern, better prognosis.",
    symptoms: ["Often asymptomatic", "Cough", "Discovered on screening"],
    untreatedRisks: ["Progression"],
    severity: [
      { stage: 1, label: "Pure Lepidic", description: "Only lepidic growth.", treatment: ["Surgical resection", "High cure rates", "May not need additional treatment", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "With Other Patterns", description: "Mixed patterns.", treatment: ["Surgery", "May need chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Advanced", description: "Advanced disease.", treatment: ["Surgery", "Chemotherapy", "Targeted therapy if mutations", "Regular monitoring", "Multidisciplinary team"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "acinar-adenocarcinoma-lung",
    name: "Acinar Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung adenocarcinoma with acinar growth pattern.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy if mutations", "Immunotherapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "papillary-adenocarcinoma-lung",
    name: "Papillary Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung adenocarcinoma with papillary growth pattern.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy if mutations", "Immunotherapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "micropapillary-adenocarcinoma-lung",
    name: "Micropapillary Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung adenocarcinoma with micropapillary pattern, aggressive.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy if mutations", "Immunotherapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "solid-adenocarcinoma-lung",
    name: "Solid Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung adenocarcinoma with solid growth pattern.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy if mutations", "Immunotherapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "mucinous-adenocarcinoma-lung",
    name: "Mucinous Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung adenocarcinoma producing mucin.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Targeted therapy if mutations", "Immunotherapy", "Chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "enteric-adenocarcinoma-lung",
    name: "Enteric Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung adenocarcinoma resembling colon cancer.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "fetal-adenocarcinoma-lung",
    name: "Fetal Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung adenocarcinoma resembling fetal lung.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Thoracic oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "colloid-adenocarcinoma-lung",
    name: "Colloid Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung adenocarcinoma with abundant mucin.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "signet-ring-cell-carcinoma-lung",
    name: "Signet Ring Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung adenocarcinoma with signet ring cells, aggressive.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if mutations", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "clear-cell-adenocarcinoma-lung",
    name: "Clear Cell Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung adenocarcinoma with clear cells.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if mutations", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "hepatoid-adenocarcinoma-lung",
    name: "Hepatoid Adenocarcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung adenocarcinoma resembling liver cancer.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "squamous-cell-carcinoma-lung-well-differentiated",
    name: "Well-Differentiated Squamous Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung squamous cell carcinoma with well-differentiated histology.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "squamous-cell-carcinoma-lung-moderately-differentiated",
    name: "Moderately Differentiated Squamous Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung squamous cell carcinoma with moderate differentiation.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "squamous-cell-carcinoma-lung-poorly-differentiated",
    name: "Poorly Differentiated Squamous Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung squamous cell carcinoma with poor differentiation, more aggressive.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "basaloid-squamous-cell-carcinoma-lung",
    name: "Basaloid Squamous Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung squamous cell carcinoma with basaloid features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "papillary-squamous-cell-carcinoma-lung",
    name: "Papillary Squamous Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung squamous cell carcinoma with papillary growth.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "clear-cell-squamous-cell-carcinoma-lung",
    name: "Clear Cell Squamous Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung squamous cell carcinoma with clear cell features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "small-cell-carcinoma-lung-variant",
    name: "Small Cell Carcinoma Variant (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Variant of small cell lung cancer.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Limited Stage", description: "Confined to one lung.", treatment: ["Chemoradiation", "Prophylactic cranial irradiation", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Extensive Stage", description: "Spread beyond one lung.", treatment: ["Chemotherapy", "Immunotherapy", "Radiation for symptoms", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Second-line chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "combined-small-cell-carcinoma-lung",
    name: "Combined Small Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Small cell lung cancer combined with non-small cell components.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Limited Stage", description: "Confined to one lung.", treatment: ["Chemoradiation", "Prophylactic cranial irradiation", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Extensive Stage", description: "Spread beyond one lung.", treatment: ["Chemotherapy", "Immunotherapy", "Radiation for symptoms", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Recurrent", description: "Returns after treatment.", treatment: ["Second-line chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "large-cell-carcinoma-lung",
    name: "Large Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Non-small cell lung cancer, large cell type.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy if high risk", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if mutations", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "large-cell-neuroendocrine-carcinoma-lung-pure",
    name: "Pure Large Cell Neuroendocrine Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Pure form of large cell neuroendocrine carcinoma of lung.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "combined-large-cell-neuroendocrine-carcinoma-lung",
    name: "Combined Large Cell Neuroendocrine Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Large cell neuroendocrine carcinoma combined with other histologies.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "adenosquamous-carcinoma-lung-mixed",
    name: "Mixed Adenosquamous Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung cancer with mixed adenocarcinoma and squamous components.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy if mutations", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "sarcomatoid-carcinoma-lung-pleomorphic",
    name: "Pleomorphic Sarcomatoid Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung cancer with pleomorphic sarcomatoid features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "spindle-cell-carcinoma-lung",
    name: "Spindle Cell Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung cancer with spindle cell features.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "carcinosarcoma-lung",
    name: "Carcinosarcoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Lung cancer with both carcinomatous and sarcomatous components.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Adjuvant chemotherapy", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "pulmonary-blastoma-adult",
    name: "Pulmonary Blastoma (Adult)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung cancer in adults, can be biphasic.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "lymphoepithelioma-like-carcinoma-lung",
    name: "Lymphoepithelioma-Like Carcinoma (Lung)",
    category: "Oncology",
    systems: ["Oncology", "Respiratory"],
    regions: ["chest"],
    overview: "Rare lung cancer, often related to EBV.",
    symptoms: ["Chest pain", "Shortness of breath", "Cough", "Weight loss"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to lung.", treatment: ["Surgical resection", "Regular monitoring", "Thoracic oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 50,
  },

  {
    id: "nutt-midline-carcinoma",
    name: "NUT Midline Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head", "neck", "chest"],
    overview: "Rare, aggressive cancer with NUT gene rearrangement.",
    symptoms: ["Varies by location", "Rapid growth", "Pain", "Mass"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to primary site.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby tissues.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy (BET inhibitors)", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-undifferentiated-carcinoma",
    name: "Sinonasal Undifferentiated Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Aggressive cancer of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Vision problems"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Chemotherapy", "Regular follow-up", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "olfactory-neuroblastoma",
    name: "Olfactory Neuroblastoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Cancer of the olfactory nerve, in the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Loss of smell", "Vision problems"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-adenocarcinoma",
    name: "Sinonasal Adenocarcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Adenocarcinoma of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Vision problems"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Regular follow-up", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-squamous-cell-carcinoma",
    name: "Sinonasal Squamous Cell Carcinoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Squamous cell carcinoma of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Vision problems"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Early", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Regular follow-up", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Immunotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "sinonasal-mucosal-melanoma",
    name: "Sinonasal Mucosal Melanoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Melanoma of the nasal cavity and sinuses, aggressive.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic immunotherapy", "Targeted therapy if BRAF mutation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "sinonasal-hemangiopericytoma",
    name: "Sinonasal Hemangiopericytoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Rare vascular tumor of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain"],
    untreatedRisks: ["Recurrence", "Rare metastasis"],
    severity: [
      { stage: 1, label: "Benign", description: "Non-cancerous.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Head and neck oncology care"] },
      { stage: 2, label: "Malignant", description: "Cancerous.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Systemic therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-angiosarcoma",
    name: "Sinonasal Angiosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Rare, aggressive vascular cancer of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Targeted therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-rhabdomyosarcoma",
    name: "Sinonasal Rhabdomyosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Rhabdomyosarcoma of the nasal cavity, most common in children.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Proptosis"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Favorable", description: "Good prognosis.", treatment: ["Surgery", "Chemotherapy", "Radiation", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Unfavorable", description: "Poor prognosis.", treatment: ["Intensive chemotherapy", "Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-chondrosarcoma",
    name: "Sinonasal Chondrosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Bone cancer of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-osteosarcoma",
    name: "Sinonasal Osteosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Bone cancer of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgical resection", "Chemotherapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-fibrosarcoma",
    name: "Sinonasal Fibrosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Sarcoma of the nasal cavity and sinuses.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-leiomyosarcoma",
    name: "Sinonasal Leiomyosarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Smooth muscle sarcoma of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-liposarcoma",
    name: "Sinonasal Liposarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Fat tissue sarcoma of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Well-Differentiated", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Dedifferentiated", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-synovial-sarcoma",
    name: "Sinonasal Synovial Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Synovial sarcoma of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Small, Low Grade", description: "Better prognosis.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Large or High Grade", description: "Worse prognosis.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-malignant-peripheral-nerve-sheath-tumor",
    name: "Sinonasal Malignant Peripheral Nerve Sheath Tumor",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Nerve sheath sarcoma of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-ewing-sarcoma",
    name: "Sinonasal Ewing Sarcoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Ewing sarcoma of the nasal cavity, most common in children.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Fever"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Intensive chemotherapy", "Surgery and/or radiation", "High cure rates", "Pediatric oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Large tumor.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to lungs or bones.", treatment: ["Intensive chemotherapy", "Surgery and radiation", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-plasmacytoma",
    name: "Sinonasal Plasmacytoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["head"],
    overview: "Plasma cell tumor of the nasal cavity, can be solitary or part of myeloma.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Progression to myeloma", "Recurrence"],
    severity: [
      { stage: 1, label: "Solitary", description: "Single lesion.", treatment: ["Radiation therapy", "Regular monitoring", "May not need systemic therapy", "Oncology care"] },
      { stage: 2, label: "Multiple", description: "Multiple lesions.", treatment: ["Radiation", "Systemic therapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Myeloma", description: "Part of multiple myeloma.", treatment: ["Systemic chemotherapy", "Stem cell transplant", "Regular monitoring", "Hematology-oncology care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-lymphoma",
    name: "Sinonasal Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["head"],
    overview: "Lymphoma of the nasal cavity, often NK/T-cell type.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Radiation therapy", "Chemotherapy", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Chemoradiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-extranodal-nk-t-cell-lymphoma",
    name: "Sinonasal Extranodal NK/T-Cell Lymphoma",
    category: "Oncology",
    systems: ["Oncology", "Hematologic"],
    regions: ["head"],
    overview: "Aggressive T-cell lymphoma of the nasal cavity, often related to EBV.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial destruction", "Fever"],
    untreatedRisks: ["Rapid progression", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Radiation therapy", "Chemotherapy", "Regular monitoring", "Hematology-oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Chemoradiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Stem cell transplant", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-melanoma-mucosal",
    name: "Sinonasal Mucosal Melanoma",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Melanoma of the nasal cavity mucosa, aggressive.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic immunotherapy", "Targeted therapy if BRAF mutation", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 18,
  },

  {
    id: "sinonasal-esthesioneuroblastoma",
    name: "Esthesioneuroblastoma",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Cancer of the olfactory nerve, also called olfactory neuroblastoma.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Loss of smell", "Vision problems"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-schwannoma-malignant",
    name: "Malignant Schwannoma (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Malignant nerve sheath tumor of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Low Grade", description: "Less aggressive.", treatment: ["Surgical resection", "Regular monitoring", "Head and neck oncology care"] },
      { stage: 2, label: "High Grade", description: "More aggressive.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Systemic chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-meningioma-malignant",
    name: "Malignant Meningioma (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology", "Nervous system"],
    regions: ["head"],
    overview: "Malignant meningioma extending to nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Headaches"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Grade II", description: "Atypical.", treatment: ["Surgical resection", "Radiation therapy", "Regular monitoring", "Head and neck/neuro-oncology care"] },
      { stage: 2, label: "Grade III", description: "Malignant.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Rare spread.", treatment: ["Systemic therapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-germ-cell-tumor",
    name: "Sinonasal Germ Cell Tumor",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Germ cell tumor of the nasal cavity, rare.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Chemotherapy", "Radiation", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-teratoma-malignant",
    name: "Malignant Teratoma (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Malignant teratoma of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Mature Teratoma", description: "Usually benign.", treatment: ["Surgical resection", "Regular monitoring", "Good prognosis", "Oncology care"] },
      { stage: 2, label: "Immature Teratoma", description: "Malignant potential.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-yolk-sac-tumor",
    name: "Yolk Sac Tumor (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Yolk sac tumor of the nasal cavity, rare.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Elevated AFP"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgery", "Chemotherapy (BEP)", "High cure rates", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-embryonal-carcinoma",
    name: "Embryonal Carcinoma (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Embryonal carcinoma of the nasal cavity, rare.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Elevated tumor markers"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgery", "Chemotherapy (BEP)", "High cure rates", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-choriocarcinoma",
    name: "Choriocarcinoma (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Choriocarcinoma of the nasal cavity, very rare.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Elevated hCG"],
    untreatedRisks: ["Rapid metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgery", "Chemotherapy", "Regular monitoring", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

  {
    id: "sinonasal-seminoma",
    name: "Seminoma (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Seminoma of the nasal cavity, very rare.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Mass"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgery", "Radiation", "High cure rates", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Radiation", "Chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Chemotherapy", "High cure rates", "Regular monitoring", "Oncology care"] },
    ],

    earlyDetectionAge: 15,
  },

  {
    id: "sinonasal-mixed-germ-cell-tumor",
    name: "Mixed Germ Cell Tumor (Sinonasal)",
    category: "Oncology",
    systems: ["Oncology"],
    regions: ["head"],
    overview: "Mixed germ cell tumor of the nasal cavity.",
    symptoms: ["Nasal congestion", "Nosebleeds", "Facial pain", "Elevated tumor markers"],
    untreatedRisks: ["Metastasis", "Death"],
    severity: [
      { stage: 1, label: "Localized", description: "Confined to sinuses.", treatment: ["Surgery", "Chemotherapy (BEP)", "High cure rates", "Oncology care"] },
      { stage: 2, label: "Locally Advanced", description: "Invades nearby structures.", treatment: ["Surgery", "Intensive chemotherapy", "Regular monitoring", "Multidisciplinary team"] },
      { stage: 3, label: "Metastatic", description: "Spread to distant organs.", treatment: ["Intensive chemotherapy", "Surgery for residual disease", "Clinical trials", "Palliative care"] },
    ],

    earlyDetectionAge: 0,
  },

].sort((a, b) => a.name.localeCompare(b.name)) as Condition[];



// ========== Colors ==========



const COLORS: Record<BodyRegionKey, string> = {

  head: "#60a5fa",

  neck: "#93c5fd",

  chest: "#34d399",

  abdomen: "#22d3ee",

  pelvis: "#fbbf24",

  l_arm: "#f472b6",

  r_arm: "#f472b6",

  l_leg: "#a78bfa",

  r_leg: "#a78bfa",

  back: "#f87171",

  skin: "#c4b5fd",

};



// ========== Utility ==========



function classNames(...xs: Array<string | false | null | undefined>) {

  return xs.filter(Boolean).join(" ");

}



// ========== Component ==========



function BodyConditionExplorer() {

  const [query, setQuery] = useState("");

  const [systemFilter, setSystemFilter] = useState<string>("All systems");

  const [activeRegion, setActiveRegion] = useState<BodyRegionKey | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [stageIndex, setStageIndex] = useState<number>(0);

  const [ageFilter, setAgeFilter] = useState<number | null>(null); // Filter by early detection age

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const systems = useMemo(() => {

    const s = new Set<string>();

    CONDITIONS.forEach((c) => c.systems.forEach((x) => s.add(x)));

    return ["All systems", ...Array.from(s).sort()];

  }, []);



  const filtered = useMemo(() => {

    const q = query.trim().toLowerCase();

    return CONDITIONS.filter((c) => {

      const inSystem = systemFilter === "All systems" || c.systems.includes(systemFilter);

      const inRegion = activeRegion ? c.regions.includes(activeRegion) : true;

      const inText = !q ||

        c.name.toLowerCase().includes(q) ||

        c.overview.toLowerCase().includes(q) ||

        c.symptoms.some((s) => s.toLowerCase().includes(q));

      const inAge = ageFilter === null || (c.earlyDetectionAge !== undefined && c.earlyDetectionAge >= ageFilter);

      return inSystem && inRegion && inText && inAge;

    });

  }, [query, systemFilter, activeRegion, ageFilter]);



  const selected = useMemo(() => filtered.find((c) => c.id === selectedId) || CONDITIONS.find((c) => c.id === selectedId) || null, [filtered, selectedId]);



  // Reset stage index when selection changes

  React.useEffect(() => {

    setStageIndex(0);

  }, [selectedId]);


  return (

    <div style={{
      ...styles.page,
      backgroundAttachment: isMobile ? "scroll" : "fixed"
    }}>

      {/* Background overlay for readability */}
      <div style={styles.overlay}></div>

      <header style={{
        ...styles.header, 
        position: "relative", 
        zIndex: 5,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        gap: isMobile ? 12 : undefined
      }}>

        <div style={{display:"flex", flexDirection:"column", gap:4}}>

          <h1 style={{margin:0, fontSize: isMobile ? 20 : 24}}>Cancer Detection Explorer</h1>

          <p style={{margin:0, opacity:0.8, fontSize:12}}>Educational only — not medical advice. If you have symptoms, seek care from a licensed clinician or emergency services if needed.</p>

        </div>

        <div style={{
          display:"flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 8 : 8, 
          alignItems: isMobile ? "stretch" : "center",
          width: isMobile ? "100%" : "auto"
        }}>

          <input

            aria-label="Search conditions"

            placeholder="Search conditions"

            value={query}

            onChange={(e) => setQuery(e.target.value)}

            style={{
              ...styles.input,
              width: isMobile ? "100%" : styles.input.width,
              fontSize: isMobile ? 16 : undefined, // Prevents zoom on iOS
              minHeight: isMobile ? 44 : undefined // Better touch target
            }}

          />

          <select 
            aria-label="Filter by system" 
            value={systemFilter} 
            onChange={(e) => setSystemFilter(e.target.value)} 
            style={{
              ...styles.select,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? 16 : undefined,
              minHeight: isMobile ? 44 : undefined
            }}
          >

            {systems.map((s) => (

              <option key={s} value={s}>{s}</option>

            ))}

          </select>

          <select 
            aria-label="Filter by early detection age" 
            value={ageFilter === null ? "All ages" : ageFilter.toString()} 
            onChange={(e) => {
              const val = e.target.value;
              setAgeFilter(val === "All ages" ? null : parseInt(val));
            }} 
            style={{
              ...styles.select,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? 16 : undefined,
              minHeight: isMobile ? 44 : undefined
            }}
          >
            <option value="All ages">All Ages</option>
            <option value="0">Pediatric (0+)</option>
            <option value="15">Teen (15+)</option>
            <option value="18">Adult (18+)</option>
            <option value="21">Young Adult (21+)</option>
            <option value="40">Middle Age (40+)</option>
            <option value="45">Mid-Adult (45+)</option>
            <option value="50">Older Adult (50+)</option>
            <option value="60">Senior (60+)</option>
          </select>

        </div>

      </header>



      <main style={{
        ...styles.main, 
        position: "relative", 
        zIndex: 1,
        gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr 1.4fr",
        gridTemplateRows: isMobile ? "auto auto auto" : undefined,
        padding: isMobile ? 8 : 16
      }}>

        {/* Body panel - always first on mobile */}
        <section style={{
          ...styles.bodyPanel,
          height: isMobile ? "auto" : undefined,
          minHeight: isMobile ? 250 : undefined,
          order: isMobile ? 1 : 0
        }}>

          <HumanBodySVG activeRegion={activeRegion} onRegion={(r) => setActiveRegion(r)} highlightRegions={selected?.regions || []} />

        </section>



        {/* Conditions list - second on mobile */}
        <section style={{
          ...styles.listPanel,
          height: isMobile ? "400px" : "calc(100dvh - 140px)",
          order: isMobile ? 2 : 0
        }}>

          <h2 style={styles.h2}>Conditions ({filtered.length})</h2>

          <div className="conditions-scroll" style={{
            display:"flex", 
            flexDirection:"column", 
            gap: 0, // Using margin-bottom instead for better mobile support
            overflowY:"auto", 
            overflowX:"hidden", 
            paddingRight:8, 
            height:"calc(100% - 40px)",
            alignItems: "stretch"
          }}>

            {filtered.map((c) => (

              <div

                key={c.id}

                role="button"

                onClick={() => setSelectedId(c.id)}

                style={{
                  ...(isMobile ? {
                    minHeight: 44,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    marginBottom: 12,
                  } : {
                    marginBottom: 10,
                  }),

                  ...styles.card,

                  borderColor: selectedId === c.id ? "#6366f1" : "#e5e7eb",
                  
                  flexShrink: 0,
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,

                }}

              >

                <div style={{display:"flex", justifyContent:"space-between", gap:8, alignItems:"center"}}>

                  <div>

                    <div style={{fontWeight:600}}>{c.name}</div>

                    <div style={{fontSize:12, opacity:0.7}}>{c.category} · {c.systems.join(", ")}</div>

                    <div style={{fontSize:12, marginTop:4, opacity:0.9}}>

                      Regions: {c.regions.map((r) => REGION_LABELS[r]).join(", ")}

                    </div>

                  </div>

                  <div style={{fontSize:12, opacity:0.7}}>{c.severity.length} stages</div>

                </div>

                <div style={{fontSize:13, marginTop:6, color:"#374151"}}>{c.overview}</div>

                <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>

                  {c.symptoms.slice(0,4).map((s, i) => (

                    <span key={i} style={styles.chip}>{s}</span>

                  ))}

                </div>

              </div>

            ))}

            {filtered.length === 0 && (

              <div style={{opacity:0.7}}>No matches. Try another search term or region.</div>

            )}

          </div>

        </section>



        {/* Detail panel - third on mobile */}
        <section style={{
          ...styles.detailPanel,
          height: isMobile ? "400px" : "calc(100dvh - 140px)",
          order: isMobile ? 3 : 0
        }}>

          {!selected ? (

            <div style={{opacity:0.8}}>Select a condition to see details.</div>

          ) : (

            <div style={{display:"flex", flexDirection:"column", gap:12}}>

              <div>

                <h2 style={{margin:"0 0 4px 0"}}>{selected.name}</h2>

                <div style={{fontSize:13, opacity:0.8}}>

                  {selected.category} · {selected.systems.join(", ")} · Regions: {selected.regions.map((r) => REGION_LABELS[r]).join(", ")}

                </div>

                {selected.earlyDetectionAge !== undefined && (
                  <div style={{marginTop:6, fontSize:13, fontWeight:500, color:"#059669"}}>
                    {selected.earlyDetectionAge === 0 
                      ? "Early Detection: No routine screening (monitor symptoms)" 
                      : `Recommended Early Detection Age: ${selected.earlyDetectionAge} years`}
                  </div>
                )}

                <p style={{marginTop:8, color:"#374151"}}>{selected.overview}</p>

              </div>



              <div>

                <h3 style={styles.h3}>Common symptoms</h3>

                <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>

                  {selected.symptoms.map((s, i) => (

                    <span key={i} style={styles.chip}>{s}</span>

                  ))}

                </div>

              </div>



              {selected.emergencySigns && selected.emergencySigns.length > 0 && (

                <div style={{...styles.alert, borderColor:"#ef4444", background:"#fef2f2"}}>

                  <div style={{fontWeight:700, color:"#991b1b"}}>Emergency signs</div>

                  <ul style={{margin:6, paddingLeft:18, color:"#991b1b"}}>

                    {selected.emergencySigns.map((e, i) => (<li key={i}>{e}</li>))}

                  </ul>

                </div>

              )}



              <div>

                <h3 style={styles.h3}>What can happen if untreated (generalized)</h3>

                <ul style={{margin:6, paddingLeft:18}}>

                  {selected.untreatedRisks.map((r, i) => (<li key={i}>{r}</li>))}

                </ul>

              </div>



              <div>

                <h3 style={styles.h3}>Severity / progression</h3>

                <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>

                  {selected.severity.map((s, idx) => {

                    const active = idx === stageIndex;

                    return (

                      <button

                        key={s.stage}

                        onClick={() => setStageIndex(idx)}

                        style={{

                          ...styles.pill,

                          background: active ? "#6366f1" : "#f3f4f6",

                          color: active ? "white" : "#111827",

                          borderColor: active ? "#6366f1" : "#e5e7eb",

                          minWidth: 0,

                        }}

                      >

                        {s.label}

                      </button>

                    );

                  })}

                </div>

                <div style={{...styles.card, marginTop:8}}>

                  <div style={{fontWeight:600, marginBottom:6}}>Stage {selected.severity[stageIndex]?.stage}: {selected.severity[stageIndex]?.label}</div>

                  <div style={{color:"#374151", marginBottom:12}}>{selected.severity[stageIndex]?.description}</div>

                  {selected.severity[stageIndex]?.treatment && selected.severity[stageIndex]?.treatment.length > 0 && (

                    <div style={{marginTop:12, paddingTop:12, borderTop:"1px solid #e5e7eb"}}>

                      <div style={{fontWeight:600, marginBottom:8, color:"#059669"}}>Treatment Recommendations</div>

                      <ul style={{margin:0, paddingLeft:20, color:"#374151"}}>

                        {selected.severity[stageIndex]?.treatment.map((t, i) => (

                          <li key={i} style={{marginBottom:6}}>{t}</li>

                        ))}

                      </ul>

                    </div>

                  )}

                </div>

              </div>



              <div style={{fontSize:12, opacity:0.7}}>

                This app is for education only and is not a substitute for professional medical advice, diagnosis, or treatment.

              </div>

            </div>

          )}

        </section>

      </main>

    </div>

  );

}



// ========== Human Body SVG ==========



type HumanBodySVGProps = {

  activeRegion: BodyRegionKey | null;

  highlightRegions: BodyRegionKey[];

  onRegion: (r: BodyRegionKey | null) => void;

};



function HumanBodySVG({ activeRegion, highlightRegions, onRegion }: HumanBodySVGProps) {

  const highlight = (key: BodyRegionKey) => highlightRegions.includes(key);

  const isActive = (key: BodyRegionKey) => activeRegion === key;

  const getOverlayStyle = (key: BodyRegionKey) => {

    const isHighlighted = highlight(key);

    const isActiveRegion = isActive(key);

    return {

      position: "absolute" as const,

      cursor: "pointer",

      backgroundColor: isActiveRegion || isHighlighted ? COLORS[key] : "transparent",

      opacity: isActiveRegion ? 0.4 : isHighlighted ? 0.3 : 0,

      transition: "all 0.2s ease",

      border: isActiveRegion ? `2px solid ${COLORS[key]}` : "none",

      borderRadius: 4,

    };

  };



  return (

    <div style={{ position: "relative", width: "100%", height: "auto" }}>

      <img

        src="/human-body-anatomical.png"

        alt="Human body anatomical illustration"

        style={styles.bodyImage}

      />

      {/* Clickable overlay regions */}
      {/* Head */}
      <div

        style={{

          ...getOverlayStyle("head"),

          top: "5%",

          left: "35%",

          width: "30%",

          height: "12%",

        }}

        onClick={() => onRegion(activeRegion === "head" ? null : "head")}

        title={REGION_LABELS.head}

      />

      {/* Neck */}
      <div

        style={{

          ...getOverlayStyle("neck"),

          top: "17%",

          left: "42%",

          width: "16%",

          height: "5%",

        }}

        onClick={() => onRegion(activeRegion === "neck" ? null : "neck")}

        title={REGION_LABELS.neck}

      />

      {/* Chest */}
      <div

        style={{

          ...getOverlayStyle("chest"),

          top: "22%",

          left: "30%",

          width: "40%",

          height: "18%",

        }}

        onClick={() => onRegion(activeRegion === "chest" ? null : "chest")}

        title={REGION_LABELS.chest}

      />

      {/* Abdomen */}
      <div

        style={{

          ...getOverlayStyle("abdomen"),

          top: "40%",

          left: "32%",

          width: "36%",

          height: "15%",

        }}

        onClick={() => onRegion(activeRegion === "abdomen" ? null : "abdomen")}

        title={REGION_LABELS.abdomen}

      />

      {/* Pelvis */}
      <div

        style={{

          ...getOverlayStyle("pelvis"),

          top: "55%",

          left: "33%",

          width: "34%",

          height: "8%",

        }}

        onClick={() => onRegion(activeRegion === "pelvis" ? null : "pelvis")}

        title={REGION_LABELS.pelvis}

      />

      {/* Left Arm */}
      <div

        style={{

          ...getOverlayStyle("l_arm"),

          top: "22%",

          left: "10%",

          width: "18%",

          height: "35%",

        }}

        onClick={() => onRegion(activeRegion === "l_arm" ? null : "l_arm")}

        title={REGION_LABELS.l_arm}

      />

      {/* Right Arm */}
      <div

        style={{

          ...getOverlayStyle("r_arm"),

          top: "22%",

          left: "72%",

          width: "18%",

          height: "35%",

        }}

        onClick={() => onRegion(activeRegion === "r_arm" ? null : "r_arm")}

        title={REGION_LABELS.r_arm}

      />

      {/* Left Leg */}
      <div

        style={{

          ...getOverlayStyle("l_leg"),

          top: "63%",

          left: "35%",

          width: "12%",

          height: "30%",

        }}

        onClick={() => onRegion(activeRegion === "l_leg" ? null : "l_leg")}

        title={REGION_LABELS.l_leg}

      />

      {/* Right Leg */}
      <div

        style={{

          ...getOverlayStyle("r_leg"),

          top: "63%",

          left: "53%",

          width: "12%",

          height: "30%",

        }}

        onClick={() => onRegion(activeRegion === "r_leg" ? null : "r_leg")}

        title={REGION_LABELS.r_leg}

      />

      {/* Back - vertical line down the center */}
      <div

        style={{

          ...getOverlayStyle("back"),

          top: "22%",

          left: "49%",

          width: "2%",

          height: "41%",

        }}

        onClick={() => onRegion(activeRegion === "back" ? null : "back")}

        title={REGION_LABELS.back}

      />

    </div>

  );

}



// ========== Styles ==========



const styles: Record<string, React.CSSProperties> = {

  page: {

    minHeight: "100vh",

    backgroundImage: "url('/lab-background.jpg')",

    backgroundSize: "cover",

    backgroundPosition: "center",

    backgroundRepeat: "no-repeat",

    backgroundAttachment: "fixed",

    color: "#111827",

    display: "flex",

    flexDirection: "column",

    position: "relative",

  },

  header: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    gap: 12,

    padding: "12px 16px",

    borderBottom: "1px solid #e5e7eb",

    position: "sticky",

    top: 0,

    background: "rgba(255,255,255,0.9)",

    backdropFilter: "saturate(180%) blur(6px)",

    zIndex: 5,

  },

  input: {

    width: 360,

    maxWidth: "40vw",

    padding: "10px 12px",

    border: "1px solid #e5e7eb",

    borderRadius: 10,

    outline: "none",

    fontSize: 14,

  },

  select: {

    padding: "10px 12px",

    border: "1px solid #e5e7eb",

    borderRadius: 10,

    outline: "none",

    fontSize: 14,

    cursor: "pointer",

  },

  main: {

    display: "grid",

    gridTemplateColumns: "1.1fr 1fr 1.4fr",

    gap: 16,

    padding: 16,

  },

  bodyPanel: {

    background: "rgba(253, 251, 246, 0.95)",

    border: "1px solid #e5e7eb",

    borderRadius: 12,

    padding: 12,

    backdropFilter: "blur(10px)",

  },

  listPanel: {

    background: "rgba(253, 251, 246, 0.95)",

    border: "1px solid #e5e7eb",

    borderRadius: 12,

    padding: 12,

    height: "calc(100dvh - 140px)",

    overflow: "hidden",

    backdropFilter: "blur(10px)",

    minHeight: 300,

  },

  detailPanel: {

    background: "rgba(253, 251, 246, 0.95)",

    border: "1px solid #e5e7eb",

    borderRadius: 12,

    padding: 12,

    height: "calc(100dvh - 140px)",

    overflow: "auto",

    backdropFilter: "blur(10px)",

    minHeight: 300,

  },

  h2: { margin: "0 0 8px 0", fontSize: 18 },

  h3: { margin: "0 0 6px 0", fontSize: 14, opacity: 0.9 },

  card: {

    border: "1px solid #e5e7eb",

    borderRadius: 12,

    padding: 12,

    background: "rgba(253, 251, 246, 0.98)",

    position: "relative",

    width: "100%",

    boxSizing: "border-box",

    display: "block",

    margin: 0,

    isolation: "isolate",

  },

  chip: {

    display: "inline-flex",

    alignItems: "center",

    padding: "4px 8px",

    fontSize: 12,

    border: "1px solid #e5e7eb",

    borderRadius: 999,

    background: "#f9fafb",

  },

  pill: {

    padding: "6px 10px",

    fontSize: 12,

    border: "1px solid #e5e7eb",

    borderRadius: 999,

    background: "#f3f4f6",

    cursor: "pointer",

  },

  alert: {

    border: "1px solid #fecaca",

    borderRadius: 12,

    padding: 12,

  },

  svg: {

    width: "100%",

    height: "auto",

    background: "rgba(253, 251, 246, 0.9)",

    border: "1px solid #e5e7eb",

    borderRadius: 12,

    padding: 12,

  },

  bodyImage: {

    width: "100%",

    height: "auto",

    display: "block",

    borderRadius: 12,

    border: "1px solid #e5e7eb",

  },

  overlay: {

    position: "fixed",

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

    background: "rgba(255, 255, 255, 0.3)",

    pointerEvents: "none",

    zIndex: 0,

  },

};

// Export a client-only wrapper to skip SSR & prevent hydration mismatches
export default dynamic(() => Promise.resolve(BodyConditionExplorer), {
  ssr: false,
});

