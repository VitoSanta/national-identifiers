using System.Globalization;
using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

/// <summary>
/// National identity documents that encode biographical data but are not the
/// tax identifier validated by <see cref="TaxIdValidator"/>. Each carries its
/// own structural validator plus a decoder, so identity consistency can check
/// them without affecting the tax-id contract.
/// See docs/IDENTITY-CONSISTENCY-RESEARCH.md.
/// </summary>
internal sealed record IdentityDocument(
    Func<object?, string?> Resolve,
    Func<string, DecodedIdentity?> Decode);

internal static class IdentityDocuments
{
    private static readonly Regex Curp =
        new(@"^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-Z]\d$", RegexOptions.Compiled);

    internal static readonly IReadOnlyDictionary<string, IdentityDocument> All =
        new Dictionary<string, IdentityDocument>(StringComparer.Ordinal)
        {
            ["AE"] = new(ResolveUae, DecodeUae),
            ["BD"] = new(ResolveBangladesh, DecodeBangladesh),
            ["BH"] = new(ResolveBahrain, DecodeBahrain),
            ["EG"] = new(ResolveEgypt, DecodeEgypt),
            ["FR"] = new(ResolveFrance, DecodeFrance),
            ["KW"] = new(ResolveKuwait, DecodeKuwait),
            ["MX"] = new(ResolveMexico, DecodeMexico),
            ["QA"] = new(ResolveQatar, DecodeQatar),
            ["TW"] = new(ResolveTaiwan, DecodeTaiwan),
            ["VN"] = new(ResolveVietnam, DecodeVietnam),
        };

    private static readonly IReadOnlyDictionary<char, int> TaiwanLetterCodes =
        new Dictionary<char, int>
        {
            ['A'] = 10, ['B'] = 11, ['C'] = 12, ['D'] = 13, ['E'] = 14, ['F'] = 15,
            ['G'] = 16, ['H'] = 17, ['I'] = 34, ['J'] = 18, ['K'] = 19, ['L'] = 20,
            ['M'] = 21, ['N'] = 22, ['O'] = 35, ['P'] = 23, ['Q'] = 24, ['R'] = 25,
            ['S'] = 26, ['T'] = 27, ['U'] = 28, ['V'] = 29, ['W'] = 32, ['X'] = 30,
            ['Y'] = 31, ['Z'] = 33,
        };

    private static bool PlausibleYear(int year) => year >= 1900 && year <= DateTime.UtcNow.Year;

    private static string Compact(object? value)
    {
        string? str = value switch
        {
            string s => s,
            int or long or double or float or decimal => value.ToString(),
            _ => null,
        };
        return str is null
            ? string.Empty
            : Regex.Replace(str.Trim(), @"[\s\-/.]+", string.Empty).ToUpperInvariant();
    }

    private static bool IsValidYmd(int year, int month, int day)
    {
        if (month is < 1 or > 12 || day < 1) return false;
        return day <= DateTime.DaysInMonth(year, month);
    }

    private static int Num(string v, int start, int end) =>
        int.Parse(v[start..end], CultureInfo.InvariantCulture);

    // Mexico CURP (18): name letters, full birth date, sex, state. Name is
    // not asserted (RENAPO's algorithm and profanity filter are deferred).
    private static string? ResolveMexico(object? value)
    {
        var n = Compact(value);
        if (!Curp.IsMatch(n)) return null;
        int century = char.IsDigit(n[16]) ? 1900 : 2000;
        return IsValidYmd(century + Num(n, 4, 6), Num(n, 6, 8), Num(n, 8, 10)) ? n : null;
    }

    private static DecodedIdentity DecodeMexico(string n) => new(
        YearMod100: Num(n, 4, 6), Month: Num(n, 6, 8), Day: Num(n, 8, 10),
        Gender: n[10] == 'H' ? 'M' : 'F', BirthPlaceCode: n.Substring(11, 2));

    // Egypt National ID (14): century + YYMMDD + governorate + serial(sex) + check.
    private static string? ResolveEgypt(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^\d{14}$")) return null;
        int century = n[0] == '3' ? 2000 : n[0] == '2' ? 1900 : n[0] == '1' ? 1800 : 0;
        if (century == 0) return null;
        return IsValidYmd(century + Num(n, 1, 3), Num(n, 3, 5), Num(n, 5, 7)) ? n : null;
    }

    private static DecodedIdentity DecodeEgypt(string n)
    {
        int century = n[0] == '3' ? 2000 : n[0] == '2' ? 1900 : 1800;
        return new DecodedIdentity(
            Year: century + Num(n, 1, 3), Month: Num(n, 3, 5), Day: Num(n, 5, 7),
            Gender: (n[12] - '0') % 2 == 1 ? 'M' : 'F', BirthPlaceCode: n.Substring(7, 2));
    }

    // France NIR / INSEE (13 or 15): sex + birth year + month + place. No day.
    private static string? ResolveFrance(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^[1-4]\d{12}(\d{2})?$")) return null;
        if (n.Length == 15)
        {
            int key = Num(n, 13, 15);
            int expected = 97 - (int)(long.Parse(n[..13], CultureInfo.InvariantCulture) % 97);
            if (key != expected) return null;
        }
        return n;
    }

    private static DecodedIdentity DecodeFrance(string n)
    {
        int month = Num(n, 3, 5);
        return new DecodedIdentity(
            YearMod100: Num(n, 1, 3),
            Month: month is >= 1 and <= 12 ? month : null,
            Gender: n[0] is '1' or '3' ? 'M' : 'F');
    }

    // Vietnam CCCD (12): province + century/sex code + birth year. No month/day.
    private static string? ResolveVietnam(object? value)
    {
        var n = Compact(value);
        return Regex.IsMatch(n, @"^\d{12}$") ? n : null;
    }

    private static DecodedIdentity DecodeVietnam(string n) => new(
        YearMod100: Num(n, 4, 6),
        Gender: (n[3] - '0') % 2 == 0 ? 'M' : 'F',
        BirthPlaceCode: n[..3]);

    // Kuwait Civil ID (12): century + YYMMDD + serial + check. Date only.
    private static string? ResolveKuwait(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^\d{12}$")) return null;
        int century = n[0] == '3' ? 2000 : n[0] == '2' ? 1900 : 0;
        if (century == 0) return null;
        return IsValidYmd(century + Num(n, 1, 3), Num(n, 3, 5), Num(n, 5, 7)) ? n : null;
    }

    private static DecodedIdentity DecodeKuwait(string n)
    {
        int century = n[0] == '3' ? 2000 : 1900;
        return new DecodedIdentity(
            Year: century + Num(n, 1, 3), Month: Num(n, 3, 5), Day: Num(n, 5, 7));
    }

    // UAE Emirates ID (15): 784 + full birth year + serial + check. Year only.
    private static string? ResolveUae(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^784\d{12}$")) return null;
        return PlausibleYear(Num(n, 3, 7)) ? n : null;
    }

    private static DecodedIdentity DecodeUae(string n) => new(Year: Num(n, 3, 7));

    // Bahrain CPR (9): YYMM + serial + check. Birth year (2-digit) and month.
    private static string? ResolveBahrain(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^\d{9}$")) return null;
        int month = Num(n, 2, 4);
        return month is >= 1 and <= 12 ? n : null;
    }

    private static DecodedIdentity DecodeBahrain(string n) =>
        new(YearMod100: Num(n, 0, 2), Month: Num(n, 2, 4));

    // Qatar QID (11): century + birth year + nationality + serial. Year only.
    private static string? ResolveQatar(object? value)
    {
        var n = Compact(value);
        return Regex.IsMatch(n, @"^[23]\d{10}$") ? n : null;
    }

    private static DecodedIdentity DecodeQatar(string n) =>
        new(Year: (n[0] == '3' ? 2000 : 1900) + Num(n, 1, 3));

    // Bangladesh NID, 17-digit form: full birth year + registration codes.
    private static string? ResolveBangladesh(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^\d{17}$")) return null;
        return PlausibleYear(Num(n, 0, 4)) ? n : null;
    }

    private static DecodedIdentity DecodeBangladesh(string n) => new(Year: Num(n, 0, 4));

    // Taiwan National ID: region letter + sex digit + 7 serial + check digit.
    // Encodes sex and registration region, no birth date. A jurisdiction
    // beyond the 195 UN states, supported for identity consistency only.
    private static string? ResolveTaiwan(object? value)
    {
        var n = Compact(value);
        if (!Regex.IsMatch(n, @"^[A-Z][12]\d{8}$")) return null;
        if (!TaiwanLetterCodes.TryGetValue(n[0], out int code)) return null;

        int[] weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];
        int sum = code / 10 + code % 10 * 9;
        for (int i = 1; i < 10; i++) sum += (n[i] - '0') * weights[i - 1];
        return sum % 10 == 0 ? n : null;
    }

    private static DecodedIdentity DecodeTaiwan(string n) =>
        new(Gender: n[1] == '1' ? 'M' : 'F', BirthPlaceCode: n[..1]);
}
