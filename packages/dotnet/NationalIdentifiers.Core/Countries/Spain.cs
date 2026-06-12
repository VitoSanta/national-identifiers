using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Spain
{
    private const string ControlLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
    private static readonly Regex Pattern = new(@"^(\d{8}|[XYZ]\d{7})[A-Z]$", RegexOptions.Compiled);

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("ES", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("ES", n, ValidationErrorCode.InvalidLength);
        if (!Pattern.IsMatch(n)) return ValidationResult.Fail("ES", n, ValidationErrorCode.InvalidFormat);

        string numeric = n[..8].Replace("X","0").Replace("Y","1").Replace("Z","2");
        char expected  = ControlLetters[int.Parse(numeric) % 23];
        if (n[8] != expected) return ValidationResult.Fail("ES", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("ES", n, ValidationLevel.Checksum);
    }
}
