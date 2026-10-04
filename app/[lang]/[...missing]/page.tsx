import { notFound } from "next/navigation";

/**
 * Every unmatched address under a language lands here, so it gets the
 * localised not-found page inside the right root layout rather than Next's
 * bare default (there is no app-wide root layout to host one).
 */
export default function Missing() {
  notFound();
}
