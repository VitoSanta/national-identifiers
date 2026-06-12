using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Albania
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AL", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("AL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^(?:\d{2}|[A-T]\d)\d{7}[A-W]$")) return ValidationResult.Fail("AL", n, ValidationErrorCode.InvalidFormat);
        int? yr = DecodeYear(n[..2]);
        int em = int.Parse(n[2..4]); int dy = int.Parse(n[4..6]);
        int? mo = DecodeMonth(em);
        int serial = int.Parse(n[6..9]);
        if (yr == null || mo == null || serial == 0 || !DateValidator.IsValidDate(yr.Value, mo.Value, dy))
            return ValidationResult.Fail("AL", n, ValidationErrorCode.InvalidFormat);
        return ValidationResult.Ok("AL", n, ValidationLevel.Format);
    }
    private static int? DecodeYear(string v)
    {
        if (Regex.IsMatch(v, @"^\d{2}$")) return 1800 + int.Parse(v);
        int decade = v[0] - 'A'; int y = v[1] - '0';
        if (decade >= 0 && decade <= 9) return 1900 + decade*10 + y;
        if (decade >= 10 && decade <= 19) return 2000 + (decade-10)*10 + y;
        return null;
    }
    private static int? DecodeMonth(int em)
    {
        foreach (int offset in new[]{0,30,50,80})
        { int m = em - offset; if (m >= 1 && m <= 12) return m; }
        return null;
    }
}
