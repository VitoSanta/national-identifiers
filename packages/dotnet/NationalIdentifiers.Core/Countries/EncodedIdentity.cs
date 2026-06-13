using System.Globalization;

namespace NationalIdentifiers.Core.Countries;

/// <summary>
/// Biographical data decoded from an identifier. Every property is optional:
/// a country contributes only what its format institutionally encodes, and a
/// decoder returns <c>null</c> when the specific value variant encodes
/// nothing (for example a 15-digit Indonesian NPWP or a modern Latvian code).
/// </summary>
internal sealed record DecodedIdentity(
    int? Year = null,
    int? YearMod100 = null,
    int? Month = null,
    int? Day = null,
    char? Gender = null,
    string? BirthPlaceCode = null);

internal static class EncodedIdentity
{
    private static readonly DateTime UaEpoch = new(1899, 12, 31, 0, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime HuEpoch = new(1867, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    // Fixed-month calendar used by Sri Lankan NIC day-of-year values
    // (February always counts 29 days regardless of leap years).
    private static readonly int[] LkMonthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    internal static readonly IReadOnlyDictionary<string, Func<string, DecodedIdentity?>> Decoders =
        new Dictionary<string, Func<string, DecodedIdentity?>>(StringComparer.Ordinal)
        {
            ["PL"] = DecodePoland,
            ["RO"] = DecodeRomania,
            ["BG"] = DecodeBulgaria,
            ["CZ"] = DecodeBirthNumber,
            ["SK"] = DecodeBirthNumber,
            ["SE"] = DecodeSweden,
            ["NO"] = DecodeNorway,
            ["DK"] = DecodeDenmark,
            ["FI"] = DecodeFinland,
            ["IS"] = DecodeIceland,
            ["EE"] = DecodeBaltic,
            ["LT"] = DecodeBaltic,
            ["LV"] = DecodeLatvia,
            ["BE"] = DecodeBelgium,
            ["UA"] = v => EpochDate(UaEpoch, NumberAt(v, 0, 5)) with { Gender = ParityGender(DigitAt(v, 8)) },
            ["HU"] = v => EpochDate(HuEpoch, NumberAt(v, 1, 6)),
            ["AL"] = DecodeAlbania,
            ["BA"] = DecodeJmbg,
            ["ME"] = DecodeJmbg,
            ["MK"] = DecodeJmbg,
            ["RS"] = DecodeJmbg,
            ["KR"] = DecodeSouthKorea,
            ["CN"] = v => new DecodedIdentity(
                Year: NumberAt(v, 6, 10), Month: NumberAt(v, 10, 12), Day: NumberAt(v, 12, 14),
                Gender: ParityGender(DigitAt(v, 16)), BirthPlaceCode: v[..6]),
            ["KZ"] = v => CenturyDigitIdentity(v, 0, DigitAt(v, 6)),
            ["UZ"] = DecodeUzbekistan,
            ["KG"] = v => new DecodedIdentity(
                Year: NumberAt(v, 5, 9), Month: NumberAt(v, 3, 5), Day: NumberAt(v, 1, 3)),
            ["MN"] = v => PartialYearIdentity(NumberAt(v, 2, 4), NumberAt(v, 4, 6), NumberAt(v, 6, 8)),
            ["CU"] = DecodeCuba,
            ["LK"] = DecodeSriLanka,
            ["MY"] = v => new DecodedIdentity(
                YearMod100: NumberAt(v, 0, 2), Month: NumberAt(v, 2, 4), Day: NumberAt(v, 4, 6),
                Gender: ParityGender(DigitAt(v, 11)), BirthPlaceCode: v.Substring(6, 2)),
            ["ID"] = DecodeIndonesia,
            ["MX"] = v => v.Length != 13 ? null : new DecodedIdentity(
                YearMod100: NumberAt(v, 4, 6), Month: NumberAt(v, 6, 8), Day: NumberAt(v, 8, 10)),
            ["ZA"] = v => v.Length != 13 ? null : new DecodedIdentity(
                YearMod100: NumberAt(v, 0, 2), Month: NumberAt(v, 2, 4), Day: NumberAt(v, 4, 6),
                Gender: DigitAt(v, 6) >= 5 ? 'M' : 'F'),
            ["NI"] = v => PartialYearIdentity(NumberAt(v, 7, 9), NumberAt(v, 5, 7), NumberAt(v, 3, 5)),
            ["SV"] = v => PartialYearIdentity(NumberAt(v, 8, 10), NumberAt(v, 6, 8), NumberAt(v, 4, 6)),
            ["PK"] = v => v.Length != 13 ? null : new DecodedIdentity(
                Gender: ParityGender(DigitAt(v, 12))),
        };

    internal static (IReadOnlyList<string> Checked, IReadOnlyList<string> Mismatched) Check(
        Func<string, DecodedIdentity?> decoder,
        string normalizedTaxId,
        TaxIdIdentity identity)
    {
        var checkedFields = new List<string>();
        var mismatchedFields = new List<string>();
        var decoded = decoder(normalizedTaxId);

        if (decoded is null)
            return (checkedFields, mismatchedFields);

        bool hasDecodedDate =
            decoded.Month is not null &&
            decoded.Day is not null &&
            (decoded.Year is not null || decoded.YearMod100 is not null);

        if (identity.BirthDate is { } birthDate && hasDecodedDate)
        {
            checkedFields.Add("birthDate");
            bool yearMatches = decoded.Year is { } fullYear
                ? fullYear == birthDate.Year
                : decoded.YearMod100 == birthDate.Year % 100;
            if (!yearMatches || decoded.Month != birthDate.Month || decoded.Day != birthDate.Day)
                mismatchedFields.Add("birthDate");
        }

        if (identity.Gender is 'M' or 'F' && decoded.Gender is not null)
        {
            checkedFields.Add("gender");
            if (identity.Gender != decoded.Gender)
                mismatchedFields.Add("gender");
        }

        if (!string.IsNullOrWhiteSpace(identity.BirthPlaceCode) && decoded.BirthPlaceCode is not null)
        {
            checkedFields.Add("birthPlaceCode");
            if (identity.BirthPlaceCode.Trim().ToUpperInvariant() != decoded.BirthPlaceCode)
                mismatchedFields.Add("birthPlaceCode");
        }

        return (checkedFields, mismatchedFields);
    }

    private static DecodedIdentity? DecodePoland(string v)
    {
        int encodedMonth = NumberAt(v, 2, 4);
        (int Min, int Max, int Century)[] offsets =
            [(81, 92, 1800), (1, 12, 1900), (21, 32, 2000), (41, 52, 2100), (61, 72, 2200)];

        foreach (var (min, max, century) in offsets)
        {
            if (encodedMonth >= min && encodedMonth <= max)
            {
                return new DecodedIdentity(
                    Year: century + NumberAt(v, 0, 2),
                    Month: encodedMonth - min + 1,
                    Day: NumberAt(v, 4, 6),
                    Gender: ParityGender(DigitAt(v, 9)));
            }
        }

        return null;
    }

    private static DecodedIdentity DecodeRomania(string v)
    {
        int first = DigitAt(v, 0);
        int century = first <= 2 ? 1900 : first <= 4 ? 1800 : first <= 8 ? 2000 : 1900;
        return new DecodedIdentity(
            Year: century + NumberAt(v, 1, 3),
            Month: NumberAt(v, 3, 5),
            Day: NumberAt(v, 5, 7),
            Gender: ParityGender(first));
    }

    private static DecodedIdentity? DecodeBulgaria(string v)
    {
        int encodedMonth = NumberAt(v, 2, 4);
        (int Century, int Month)? decoded =
            encodedMonth is >= 1 and <= 12 ? (1900, encodedMonth)
            : encodedMonth is >= 21 and <= 32 ? (1800, encodedMonth - 20)
            : encodedMonth is >= 41 and <= 52 ? (2000, encodedMonth - 40)
            : null;
        if (decoded is null) return null;
        return new DecodedIdentity(
            Year: decoded.Value.Century + NumberAt(v, 0, 2),
            Month: decoded.Value.Month,
            Day: NumberAt(v, 4, 6),
            // EGN: the ninth digit is even for men and odd for women.
            Gender: DigitAt(v, 8) % 2 == 0 ? 'M' : 'F');
    }

    private static DecodedIdentity DecodeBirthNumber(string v)
    {
        int shortYear = NumberAt(v, 0, 2);
        int encodedMonth = NumberAt(v, 2, 4);
        int month = encodedMonth > 70 ? encodedMonth - 70
            : encodedMonth > 50 ? encodedMonth - 50
            : encodedMonth > 20 ? encodedMonth - 20
            : encodedMonth;
        int year = v.Length == 10
            ? (shortYear >= 54 ? 1900 : 2000) + shortYear
            : 1900 + shortYear;
        bool female = encodedMonth is > 50 and <= 62 or > 70;
        return new DecodedIdentity(
            Year: year, Month: month, Day: NumberAt(v, 4, 6), Gender: female ? 'F' : 'M');
    }

    private static DecodedIdentity DecodeSweden(string v)
    {
        string shortValue = v[^10..];
        int encodedDay = NumberAt(shortValue, 4, 6);
        var baseIdentity = new DecodedIdentity(
            Month: NumberAt(shortValue, 2, 4),
            Day: encodedDay > 60 ? encodedDay - 60 : encodedDay,
            Gender: ParityGender(DigitAt(shortValue, 8)));
        return v.Length == 12
            ? baseIdentity with { Year = NumberAt(v, 0, 4) }
            : baseIdentity with { YearMod100 = NumberAt(shortValue, 0, 2) };
    }

    private static DecodedIdentity DecodeNorway(string v)
    {
        int encodedDay = NumberAt(v, 0, 2);
        int encodedMonth = NumberAt(v, 2, 4);
        return new DecodedIdentity(
            YearMod100: NumberAt(v, 4, 6),
            Month: encodedMonth > 40 ? encodedMonth - 40 : encodedMonth,
            Day: encodedDay > 40 ? encodedDay - 40 : encodedDay,
            Gender: ParityGender(DigitAt(v, 8)));
    }

    private static DecodedIdentity DecodeDenmark(string v)
    {
        int shortYear = NumberAt(v, 4, 6);
        int centuryDigit = DigitAt(v, 6);
        int year = centuryDigit <= 3 ? 1900 + shortYear
            : centuryDigit is 4 or 9 ? (shortYear <= 36 ? 2000 : 1900) + shortYear
            : (shortYear <= 57 ? 2000 : 1800) + shortYear;
        return new DecodedIdentity(
            Year: year, Month: NumberAt(v, 2, 4), Day: NumberAt(v, 0, 2),
            Gender: ParityGender(DigitAt(v, 9)));
    }

    private static DecodedIdentity? DecodeFinland(string v)
    {
        int? century = v[6] switch
        {
            '+' => 1800,
            '-' or 'U' or 'V' or 'W' or 'X' or 'Y' => 1900,
            >= 'A' and <= 'F' => 2000,
            _ => null,
        };
        if (century is null) return null;
        return new DecodedIdentity(
            Year: century + NumberAt(v, 4, 6),
            Month: NumberAt(v, 2, 4),
            Day: NumberAt(v, 0, 2),
            Gender: ParityGender(NumberAt(v, 7, 10)));
    }

    private static DecodedIdentity DecodeIceland(string v)
    {
        int centuryDigit = DigitAt(v, 9);
        int century = centuryDigit == 0 ? 2000 : centuryDigit == 9 ? 1900 : 1800;
        return new DecodedIdentity(
            Year: century + NumberAt(v, 4, 6), Month: NumberAt(v, 2, 4), Day: NumberAt(v, 0, 2));
    }

    private static DecodedIdentity DecodeBaltic(string v)
    {
        int first = DigitAt(v, 0);
        return new DecodedIdentity(
            Year: 1800 + (first - 1) / 2 * 100 + NumberAt(v, 1, 3),
            Month: NumberAt(v, 3, 5),
            Day: NumberAt(v, 5, 7),
            Gender: ParityGender(first));
    }

    private static DecodedIdentity? DecodeLatvia(string v)
    {
        if (v.StartsWith("32", StringComparison.Ordinal)) return null;
        int centuryDigit = DigitAt(v, 6);
        var baseIdentity = new DecodedIdentity(Month: NumberAt(v, 2, 4), Day: NumberAt(v, 0, 2));
        return centuryDigit <= 2
            ? baseIdentity with { Year = 1800 + centuryDigit * 100 + NumberAt(v, 4, 6) }
            : baseIdentity with { YearMod100 = NumberAt(v, 4, 6) };
    }

    private static DecodedIdentity DecodeBelgium(string v)
    {
        long firstNine = long.Parse(v[..9], CultureInfo.InvariantCulture);
        int checkDigits = NumberAt(v, 9, 11);
        bool isPost2000 = checkDigits == 97 - (int)((2_000_000_000L + firstNine) % 97);
        int month = NumberAt(v, 2, 4);
        int day = NumberAt(v, 4, 6);
        char gender = ParityGender(DigitAt(v, 8));
        // Unknown birth dates are registered with zeroed month/day components.
        if (month == 0 || day == 0)
            return new DecodedIdentity(Gender: gender);
        return new DecodedIdentity(
            Year: (isPost2000 ? 2000 : 1900) + NumberAt(v, 0, 2),
            Month: month, Day: day, Gender: gender);
    }

    private static DecodedIdentity? DecodeAlbania(string v)
    {
        int year;
        if (char.IsDigit(v[0]))
        {
            year = 1800 + NumberAt(v, 0, 2);
        }
        else
        {
            int decade = v[0] - 'A';
            int inDecade = DigitAt(v, 1);
            year = decade <= 9 ? 1900 + decade * 10 + inDecade : 2000 + (decade - 10) * 10 + inDecade;
        }

        int encodedMonth = NumberAt(v, 2, 4);
        foreach (int offset in (int[])[0, 30, 50, 80])
        {
            int candidate = encodedMonth - offset;
            if (candidate is >= 1 and <= 12)
                return new DecodedIdentity(Year: year, Month: candidate, Day: NumberAt(v, 4, 6));
        }

        return null;
    }

    private static DecodedIdentity DecodeJmbg(string v)
    {
        int yearPart = NumberAt(v, 4, 7);
        return new DecodedIdentity(
            Year: yearPart >= 800 ? 1000 + yearPart : 2000 + yearPart,
            Month: NumberAt(v, 2, 4),
            Day: NumberAt(v, 0, 2),
            Gender: NumberAt(v, 9, 12) < 500 ? 'M' : 'F');
    }

    private static DecodedIdentity DecodeSouthKorea(string v)
    {
        int centuryDigit = DigitAt(v, 6);
        int century = centuryDigit is 9 or 0 ? 1800
            : centuryDigit is <= 2 or 5 or 6 ? 1900
            : 2000;
        return new DecodedIdentity(
            Year: century + NumberAt(v, 0, 2),
            Month: NumberAt(v, 2, 4),
            Day: NumberAt(v, 4, 6),
            Gender: ParityGender(centuryDigit));
    }

    private static DecodedIdentity DecodeUzbekistan(string v)
    {
        int first = DigitAt(v, 0);
        return new DecodedIdentity(
            Year: (17 + (first + 1) / 2) * 100 + NumberAt(v, 5, 7),
            Month: NumberAt(v, 3, 5),
            Day: NumberAt(v, 1, 3),
            Gender: ParityGender(first));
    }

    private static DecodedIdentity DecodeCuba(string v)
    {
        int centuryDigit = DigitAt(v, 6);
        int century = centuryDigit == 9 ? 1800 : centuryDigit <= 5 ? 1900 : 2000;
        return new DecodedIdentity(
            Year: century + NumberAt(v, 0, 2), Month: NumberAt(v, 2, 4), Day: NumberAt(v, 4, 6));
    }

    private static DecodedIdentity? DecodeSriLanka(string v)
    {
        bool isLegacy = v.Length == 10;
        int year = isLegacy ? 1900 + NumberAt(v, 0, 2) : NumberAt(v, 0, 4);
        int dayOfYear = isLegacy ? NumberAt(v, 2, 5) : NumberAt(v, 4, 7);
        int normalizedDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

        int remaining = normalizedDay;
        for (int month = 0; month < 12; month++)
        {
            if (remaining <= LkMonthLengths[month])
            {
                return new DecodedIdentity(
                    Year: year, Month: month + 1, Day: remaining,
                    Gender: dayOfYear > 500 ? 'F' : 'M');
            }

            remaining -= LkMonthLengths[month];
        }

        return null;
    }

    private static DecodedIdentity? DecodeIndonesia(string v)
    {
        if (v.Length != 16) return null;
        int rawDay = NumberAt(v, 6, 8);
        return new DecodedIdentity(
            YearMod100: NumberAt(v, 10, 12),
            Month: NumberAt(v, 8, 10),
            Day: rawDay > 40 ? rawDay - 40 : rawDay,
            Gender: rawDay > 40 ? 'F' : 'M',
            BirthPlaceCode: v[..6]);
    }

    private static DecodedIdentity CenturyDigitIdentity(string v, int dateStart, int centuryDigit) =>
        new(
            Year: (17 + (centuryDigit + 1) / 2) * 100 + NumberAt(v, dateStart, dateStart + 2),
            Month: NumberAt(v, dateStart + 2, dateStart + 4),
            Day: NumberAt(v, dateStart + 4, dateStart + 6),
            Gender: ParityGender(centuryDigit));

    private static DecodedIdentity PartialYearIdentity(int yearPart, int month, int day) =>
        new(YearMod100: yearPart, Month: month, Day: day);

    private static DecodedIdentity EpochDate(DateTime epoch, int days)
    {
        var date = epoch.AddDays(days);
        return new DecodedIdentity(Year: date.Year, Month: date.Month, Day: date.Day);
    }

    private static int DigitAt(string value, int index) => value[index] - '0';

    private static int NumberAt(string value, int start, int end) =>
        int.Parse(value[start..end], CultureInfo.InvariantCulture);

    private static char ParityGender(int number) => number % 2 == 1 ? 'M' : 'F';
}
