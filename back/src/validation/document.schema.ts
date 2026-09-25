import { z } from "zod";

export const uploadDocumentSchema = z.object({
  title: z.string().trim().min(1, "عنوان سند الزامی است"),

  doc_code: z.string().trim().min(1, "کد سند الزامی است"),

  issue_date: z.string().refine(
    (val) => {
      return !isNaN(Date.parse(val));
    },
    {
      message: "تاریخ معتبر نیست",
    },
  ),
});
