export type RefField = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "number" | "email" | "select";
  options?: string[];
};
export type RefEntity = {
  slug: string;
  table: string;
  label: string;
  singular: string;
  columns: { key: string; label: string; num?: boolean }[];
  fields: RefField[];
};

export const REF: Record<string, RefEntity> = {
  shipyards: {
    slug: "shipyards", table: "shipyards", label: "Shipyards", singular: "Shipyard",
    columns: [{ key: "name", label: "Name" }, { key: "country", label: "Country" }, { key: "city", label: "City" }, { key: "specialisations", label: "Specialisations" }],
    fields: [
      { key: "name", label: "Name" }, { key: "country", label: "Country" }, { key: "city", label: "City" },
      { key: "website", label: "Website" }, { key: "specialisations", label: "Specialisations" }, { key: "services", label: "Services", kind: "textarea" },
    ],
  },
  marinas: {
    slug: "marinas", table: "marinas", label: "Marinas", singular: "Marina",
    columns: [{ key: "name", label: "Name" }, { key: "country", label: "Country" }, { key: "city", label: "City" }, { key: "berths", label: "Berths", num: true }],
    fields: [
      { key: "name", label: "Name" }, { key: "country", label: "Country" }, { key: "city", label: "City" }, { key: "website", label: "Website" },
      { key: "berths", label: "Berths", kind: "number" }, { key: "max_loa", label: "Max LOA (m)", kind: "number" }, { key: "amenities", label: "Amenities", kind: "textarea" },
    ],
  },
  suppliers: {
    slug: "suppliers", table: "suppliers", label: "Suppliers", singular: "Supplier",
    columns: [{ key: "name", label: "Name" }, { key: "supplier_type", label: "Type" }, { key: "country", label: "Country" }, { key: "rating", label: "Rating", num: true }],
    fields: [
      { key: "name", label: "Name" },
      { key: "supplier_type", label: "Type", kind: "select", options: ["Engineer", "Surveyor", "Insurance Broker", "Legal", "Crew Agency", "Cleaning", "Chandlery", "Photography", "Other"] },
      { key: "country", label: "Country" }, { key: "email", label: "Email", kind: "email" }, { key: "phone", label: "Phone" },
      { key: "rating", label: "Rating (1–5)", kind: "number" }, { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  designers: {
    slug: "designers", table: "designers", label: "Designers", singular: "Designer",
    columns: [{ key: "name", label: "Name" }, { key: "discipline", label: "Discipline" }, { key: "nationality", label: "Nationality" }],
    fields: [
      { key: "name", label: "Name" },
      { key: "discipline", label: "Discipline", kind: "select", options: ["Naval Architect", "Exterior Designer", "Interior Designer", "All"] },
      { key: "nationality", label: "Nationality" }, { key: "website", label: "Website" }, { key: "notable_works", label: "Notable works", kind: "textarea" },
    ],
  },
  partnerships: {
    slug: "partnerships", table: "partnerships", label: "Partnerships", singular: "Partnership",
    columns: [{ key: "name", label: "Name" }, { key: "type", label: "Type" }, { key: "region", label: "Region" }, { key: "status", label: "Status" }],
    fields: [
      { key: "name", label: "Name" },
      { key: "type", label: "Type", kind: "select", options: ["Co-Brokerage", "Referral Agent", "Charter Partner", "Corporate Client", "Marina Partner", "Other"] },
      { key: "region", label: "Region" }, { key: "commission_structure", label: "Commission structure", kind: "textarea" },
      { key: "status", label: "Status", kind: "select", options: ["active", "inactive"] },
    ],
  },
  destinations: {
    slug: "destinations", table: "destinations", label: "Destinations", singular: "Destination",
    columns: [{ key: "name", label: "Name" }, { key: "country", label: "Country" }, { key: "region", label: "Region" }],
    fields: [{ key: "name", label: "Name" }, { key: "country", label: "Country" }, { key: "region", label: "Region" }, { key: "description", label: "Description", kind: "textarea" }],
  },
};

export const REF_SLUGS = Object.keys(REF);
