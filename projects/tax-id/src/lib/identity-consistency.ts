import { TaxIdCountry } from './models';
import { validateTaxId } from './validate-tax-id';
import { checkItalianIdentity } from './countries/italy-identity';

/**
 * Outcome of a local structural-consistency check between an identifier and
 * user-supplied biographical data.
 *
 * A `match` means only that the identifier can be derived from compatible
 * data. It never proves that an authority issued the identifier or that it
 * belongs to the person. See docs/IDENTITY-CONSISTENCY.md.
 */
export type IdentityConsistencyStatus =
  | 'match'
  | 'partial_match'
  | 'mismatch'
  | 'insufficient_data'
  | 'not_supported';

export type TaxIdIdentityField =
  | 'firstName'
  | 'lastName'
  | 'birthDate'
  | 'gender'
  | 'birthPlaceCode';

export interface TaxIdIdentity {
  readonly firstName?: string;
  readonly lastName?: string;
  /** ISO date, `yyyy-mm-dd`. Unparseable values are treated as not provided. */
  readonly birthDate?: string;
  readonly gender?: 'M' | 'F';
  /** Country-specific birthplace code (for Italy: the cadastral/Belfiore code, e.g. `H501`). */
  readonly birthPlaceCode?: string;
}

export interface TaxIdIdentityRequest {
  readonly country: TaxIdCountry | string | null | undefined;
  readonly taxId: unknown;
  readonly identity: TaxIdIdentity;
}

export interface TaxIdIdentityCapability {
  /** `full` when every biographical field is encoded in the identifier. */
  readonly level: 'full' | 'partial';
  readonly requiredFields: readonly TaxIdIdentityField[];
}

export interface TaxIdIdentityConsistencyResult {
  readonly status: IdentityConsistencyStatus;
  readonly country: string;
  /** Whether the identifier itself passed `validateTaxId`. */
  readonly taxIdValid: boolean;
  /** Fields that were provided and evaluated against the identifier. */
  readonly checkedFields: readonly TaxIdIdentityField[];
  /** Evaluated fields whose value is not consistent with the identifier. */
  readonly mismatchedFields: readonly TaxIdIdentityField[];
  /** Capability-required fields that were not provided or not parseable. */
  readonly missingFields: readonly TaxIdIdentityField[];
}

interface IdentityChecker {
  readonly capability: TaxIdIdentityCapability;
  readonly check: (
    normalizedTaxId: string,
    identity: TaxIdIdentity,
  ) => { checked: TaxIdIdentityField[]; mismatched: TaxIdIdentityField[] };
}

const IDENTITY_CHECKERS: Readonly<Partial<Record<TaxIdCountry, IdentityChecker>>> = {
  IT: {
    capability: {
      level: 'full',
      requiredFields: ['firstName', 'lastName', 'birthDate', 'gender', 'birthPlaceCode'],
    },
    check: checkItalianIdentity,
  },
};

/** Declared identity-consistency capability for a country, or `null`. */
export function taxIdIdentityCapability(
  country: TaxIdCountry | string | null | undefined,
): TaxIdIdentityCapability | null {
  const normalizedCountry =
    typeof country === 'string' ? country.trim().toUpperCase() : '';
  return IDENTITY_CHECKERS[normalizedCountry as TaxIdCountry]?.capability ?? null;
}

/**
 * Compares an identifier with biographical data where the identifier format
 * encodes it. Local and offline: no value is logged, persisted or echoed
 * back; results carry field names and status codes only.
 */
export function validateTaxIdIdentity(
  request: TaxIdIdentityRequest,
): TaxIdIdentityConsistencyResult {
  const validation = validateTaxId(request.country, request.taxId);
  const checker = IDENTITY_CHECKERS[validation.country as TaxIdCountry];

  if (!checker) {
    return {
      status: 'not_supported',
      country: validation.country,
      taxIdValid: validation.valid,
      checkedFields: [],
      mismatchedFields: [],
      missingFields: [],
    };
  }

  if (!validation.valid) {
    return {
      status: 'insufficient_data',
      country: validation.country,
      taxIdValid: false,
      checkedFields: [],
      mismatchedFields: [],
      missingFields: missingRequiredFields(checker, []),
    };
  }

  const { checked, mismatched } = checker.check(
    validation.normalizedValue,
    request.identity ?? {},
  );
  const missing = missingRequiredFields(checker, checked);

  let status: IdentityConsistencyStatus;
  if (checked.length === 0) {
    status = 'insufficient_data';
  } else if (mismatched.length > 0) {
    status = 'mismatch';
  } else if (missing.length > 0) {
    status = 'partial_match';
  } else {
    status = 'match';
  }

  return {
    status,
    country: validation.country,
    taxIdValid: true,
    checkedFields: checked,
    mismatchedFields: mismatched,
    missingFields: missing,
  };
}

function missingRequiredFields(
  checker: IdentityChecker,
  checked: readonly TaxIdIdentityField[],
): TaxIdIdentityField[] {
  return checker.capability.requiredFields.filter((field) => !checked.includes(field));
}
