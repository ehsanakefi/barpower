export type CreateCompanyDTO = {
  name: string;
  slug: string; // unique
  isActive?: boolean;
};

export type UpdateCompanyDTO = {
  name?: string;
  slug?: string;
  isActive?: boolean;
};
