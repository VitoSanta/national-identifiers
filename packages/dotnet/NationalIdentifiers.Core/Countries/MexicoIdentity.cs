using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class MexicoIdentity
{
    private const string Vowels = "AEIOU";
    private const string Consonants = "BCDFGHJKLMNPQRSTVWXYZ";

    private static readonly HashSet<string> SurnameParticles =
        new(StringComparer.Ordinal)
        {
            "DA", "DAS", "DE", "DEL", "DER", "DI", "DIE", "DD", "EL", "LA",
            "LAS", "LE", "LES", "LOS", "MAC", "MC", "VAN", "VON", "Y",
        };

    private static readonly HashSet<string> CommonFirstNames =
        new(StringComparer.Ordinal) { "JOSE", "J", "MARIA", "MA" };

    private static readonly HashSet<string> InconvenientWords =
        new(StringComparer.Ordinal)
        {
            "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO",
            "CAKA", "CAKO", "COGE", "COGI", "COJA", "COJE", "COJI", "COJO",
            "COLA", "CULO", "FALO", "FETO", "GETA", "GUEI", "GUEY", "JETA",
            "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA", "KAKO", "KOGE",
            "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LILO",
            "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMO", "MEAR", "MEAS",
            "MEON", "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA", "NACO",
            "PEDA", "PEDO", "PENE", "PIPI", "PITO", "POPO", "PUTA", "PUTO",
            "QULO", "RATA", "ROBA", "ROBE", "ROBO", "RUIN", "SENO", "TETA",
            "VACA", "VAGA", "VAGO", "VAKA", "VUEI", "VUEY", "WUEI", "WUEY",
        };

    internal static (IReadOnlyList<string> Checked, IReadOnlyList<string> Mismatched) Check(
        string curp,
        TaxIdIdentity identity)
    {
        var checkedFields = new List<string>();
        var mismatchedFields = new List<string>();

        if (!string.IsNullOrWhiteSpace(identity.LastName))
        {
            checkedFields.Add("lastName");
            var encoded = Encode(identity.FirstName ?? string.Empty, identity.LastName);
            if (encoded.Prefix[..3] != curp[..3]
                || encoded.InternalConsonants[..2] != curp[13..15])
                mismatchedFields.Add("lastName");
        }

        if (!string.IsNullOrWhiteSpace(identity.FirstName))
        {
            checkedFields.Add("firstName");
            var encoded = Encode(identity.FirstName, identity.LastName ?? string.Empty);
            if (encoded.Prefix[3] != curp[3] || encoded.InternalConsonants[2] != curp[15])
                mismatchedFields.Add("firstName");
        }

        return (checkedFields, mismatchedFields);
    }

    internal static (string Prefix, string InternalConsonants) Encode(
        string firstName,
        string lastName)
    {
        var givenName = EffectiveGivenName(firstName);
        var surnameParts = Words(lastName)
            .Where(part => !SurnameParticles.Contains(part))
            .ToArray();
        var paternal = surnameParts.ElementAtOrDefault(0) ?? string.Empty;
        var maternal = surnameParts.ElementAtOrDefault(1) ?? string.Empty;

        var prefix = string.Concat(
            FirstOrX(paternal),
            FirstInternal(paternal, Vowels),
            FirstOrX(maternal),
            FirstOrX(givenName));
        if (InconvenientWords.Contains(prefix))
            prefix = $"{prefix[0]}X{prefix[2..]}";

        var internalConsonants = string.Concat(
            FirstInternal(paternal, Consonants),
            FirstInternal(maternal, Consonants),
            FirstInternal(givenName, Consonants));
        return (prefix, internalConsonants);
    }

    private static string EffectiveGivenName(string value)
    {
        var parts = Words(value);
        return parts.Length > 1 && CommonFirstNames.Contains(parts[0]) ? parts[1]
            : parts.ElementAtOrDefault(0) ?? string.Empty;
    }

    private static string[] Words(string value)
    {
        var builder = new StringBuilder(value.Length);
        foreach (var character in value.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
                continue;
            var upper = char.ToUpperInvariant(character);
            builder.Append(upper == 'Ñ' ? 'X' : upper);
        }
        return Regex.Split(builder.ToString(), "[^A-Z]+")
            .Where(part => part.Length > 0)
            .ToArray();
    }

    private static char FirstOrX(string value) => value.Length > 0 ? value[0] : 'X';

    private static char FirstInternal(string value, string alphabet) =>
        value.Skip(1).FirstOrDefault(alphabet.Contains) is var found && found != default
            ? found
            : 'X';
}
