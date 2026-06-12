using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class BirthNumberHelper
{
    private static readonly Regex StripSlash = new(@"[\s/]+", RegexOptions.Compiled);

    internal static ValidationResult Validate(string country, object? value)
    {
        string n = value is string s
            ? StripSlash.Replace(s.Trim(), "")
            : TaxIdNormalizer.Normalize(value);

        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail(country, n, ValidationErrorCode.Empty);
        if (n.Length != 9 && n.Length != 10)
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidLength);
        foreach (char c in n) if (!char.IsDigit(c))
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidFormat);
        if (!HasValidEncodedDate(n))
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidFormat);
        if (n.Length == 9)
            return ValidationResult.Ok(country, n, ValidationLevel.Format);

        // 10-digit: divisible by 11
        long num = long.Parse(n);
        if (num % 11 != 0)
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidChecksum);

        return ValidationResult.Ok(country, n, ValidationLevel.Checksum);
    }

    private static bool HasValidEncodedDate(string v)
    {
        int shortYear    = int.Parse(v[..2]);
        int encodedMonth = int.Parse(v[2..4]);
        int day          = int.Parse(v[4..6]);
        int month = encodedMonth > 70 ? encodedMonth - 70
                  : encodedMonth > 50 ? encodedMonth - 50
                  : encodedMonth > 20 ? encodedMonth - 20
                  : encodedMonth;
        int year  = shortYear >= 54 ? 1900 + shortYear : 2000 + shortYear;
        return DateValidator.IsValidDate(year, month, day);
    }
}
