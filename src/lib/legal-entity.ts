/**
 * The operator's identity, as it appears in T&C §1 and §35.
 *
 * One source for all three legal pages, because these are the details a user
 * relies on to know who they are contracting with and where to chase a
 * dispute — three copies is three chances for one of them to go stale after
 * incorporation lands.
 *
 * Deliberately absent: the Commercial Registry number and the tax
 * registration number, which do not exist yet. They are omitted rather than
 * rendered as an empty row — a blank next to "Commercial Registry" reads as
 * a registration nobody can find, which is worse than not making the claim.
 * Add them here when they are issued.
 *
 * Postal address is absent for a different reason and permanently: Lebanon
 * has no postal address system, so §35's postal row has nothing to hold.
 */
export const LEGAL_ENTITY = {
  /** Provisional — see the open risk in GO-LIVE-BLOCKERS.md §1. */
  name: "Fann-Leb",
  representative: "Mr. Nabil Katra",
  representativeCapacity: "Lawyer",
  address: "Mina Street, Bakery Building, Tripoli, Lebanon",
  email: "admin@fann-leb.com",
  /**
   * The support line and the WhatsApp number are the same number, which is
   * why it carries the WhatsApp mark rather than being listed twice.
   */
  phone: "+961 71 652 215",
  /** E.164, no spaces — what wa.me and tel: need. */
  phoneE164: "96171652215",
} as const;
