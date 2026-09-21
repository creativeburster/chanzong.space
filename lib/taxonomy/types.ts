export interface PersonItem {
  id: string;
  "name": string;
  "title": string;
  "era": string;
  "lifeStory": string;
  "teachings": string;
  "quotes": string[];
  "classics": string[];
  "relatedConcepts": string[];
  "relatedMethods": string[];
  "relatedPersons": string[];
  "relatedBooks": string[];
}

export interface ConceptItem {
  id: string;
  "title": string;
  "category": string;
  "summary": string;
  etymology?: string;
  quotes?: string[];
  guidance?: string;
  "classicRef": string;
  "relatedConcepts": string[];
  "relatedPersons": string[];
  "relatedBooks": string[];
}

export interface MethodItem {
  id: string;
  "title": string;
  "summary": string;
  origin?: string;
  steps: string[];
  pitfalls?: string[];
  "classicRef": string;
  "relatedConcepts": string[];
  "relatedPersons": string[];
  "relatedBooks": string[];
}

export interface KoanItem {
  id: string;
  "question": string;
  "answer": string;
  context?: string;
  interpretation?: string;
  "master": string;
  "source": string;
  "relatedConcepts": string[];
  "relatedPersons": string[];
  "relatedBooks": string[];
}

export interface FAQItem {
  id: string;
  "question": string;
  "answer": string;
  "relatedBooks": string[];
  relatedQa?: string;
  [key: string]: any;
}

