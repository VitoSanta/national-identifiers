using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Senegal
{
    private static readonly Regex CofiPattern = new(@"^[012][ABCDEFGHJKLMNPQRSTUVWZ]\d$", RegexOptions.Compiled);
    private static readonly int[] ChecksumWeights = { 1,2,1,2,1,2,1,2,1 };

    internal static ValidationResult Validate(object? value)
    {
        var n = value is string s
            ? Regex.Replace(s.Trim().ToUpperInvariant(), @"[\s\-/,]+", "")
            : string.Empty;
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("SN", n, ValidationErrorCode.Empty);
        bool hasCofi = n.Length == 10 || n.Length == 12;
        string ninea = hasCofi ? n[..^3] : n;
        string cofi  = hasCofi ? n[^3..] : string.Empty;
        if (ninea.Length != 7 && ninea.Length != 9)
            return ValidationResult.Fail("SN", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(ninea, @"^\d+$") || (cofi.Length > 0 && !CofiPattern.IsMatch(cofi)))
            return ValidationResult.Fail("SN", n, ValidationErrorCode.InvalidFormat);
        string padded = ninea.PadLeft(9, '0');
        int checksum = padded.Select((digit, index) => (digit - '0') * ChecksumWeights[index]).Sum();
        if (checksum % 10 != 0)
            return ValidationResult.Fail("SN", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("SN", n, ValidationLevel.Checksum);
    }
}
