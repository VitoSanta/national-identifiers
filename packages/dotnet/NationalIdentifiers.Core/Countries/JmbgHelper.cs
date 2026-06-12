namespace NationalIdentifiers.Core.Countries;

internal static class JmbgHelper
{
    internal static ValidationResult Validate(string country, object? value, Func<int, bool> isAllowedRegion)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail(country, n, ValidationErrorCode.Empty);
        if (n.Length != 13)
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidLength);
        foreach (char c in n) if (!char.IsDigit(c))
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidFormat);

        int day     = int.Parse(n[..2]);
        int month   = int.Parse(n[2..4]);
        int yearPart = int.Parse(n[4..7]);
        int region  = int.Parse(n[7..9]);
        int year    = yearPart >= 800 ? 1000 + yearPart : 2000 + yearPart;

        if (!DateValidator.IsValidDate(year, month, day) || !isAllowedRegion(region))
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidFormat);

        int[] d = n.Select(c => c - '0').ToArray();
        int ws =
            7 * (d[0] + d[6]) +
            6 * (d[1] + d[7]) +
            5 * (d[2] + d[8]) +
            4 * (d[3] + d[9]) +
            3 * (d[4] + d[10]) +
            2 * (d[5] + d[11]);
        int control = 11 - (ws % 11);
        int expected = control >= 10 ? 0 : control;

        if (d[12] != expected)
            return ValidationResult.Fail(country, n, ValidationErrorCode.InvalidChecksum);

        return ValidationResult.Ok(country, n, ValidationLevel.Checksum);
    }
}
