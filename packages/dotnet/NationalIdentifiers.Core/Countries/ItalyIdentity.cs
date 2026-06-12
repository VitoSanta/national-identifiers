using System.Globalization;
using System.Text;

namespace NationalIdentifiers.Core.Countries;

internal static class ItalyIdentity
{
    private const string Vowels = "AEIOU";
    private const string MonthLetters = "ABCDEHLMPRST";

    // Positions that hold digits in a non-omocodic fiscal code.
    private static readonly int[] NumericPositions = [6, 7, 9, 10, 12, 13, 14];

    private static readonly IReadOnlyDictionary<char, char> OmocodiaDecode =
        new Dictionary<char, char>
        {
            ['L'] = '0', ['M'] = '1', ['N'] = '2', ['P'] = '3', ['Q'] = '4',
            ['R'] = '5', ['S'] = '6', ['T'] = '7', ['U'] = '8', ['V'] = '9',
        };

    internal static (IReadOnlyList<string> Checked, IReadOnlyList<string> Mismatched) Check(
        string normalizedTaxId,
        TaxIdIdentity identity)
    {
        var checkedFields = new List<string>();
        var mismatchedFields = new List<string>();
        var code = DecodeOmocodia(normalizedTaxId);

        int encodedDay = int.Parse(code[9..11], CultureInfo.InvariantCulture);
        int dayOfBirth = encodedDay > 40 ? encodedDay - 40 : encodedDay;

        if (!string.IsNullOrWhiteSpace(identity.LastName))
        {
            checkedFields.Add("lastName");
            if (EncodeSurname(identity.LastName) != code[..3])
                mismatchedFields.Add("lastName");
        }

        if (!string.IsNullOrWhiteSpace(identity.FirstName))
        {
            checkedFields.Add("firstName");
            if (EncodeGivenName(identity.FirstName) != code[3..6])
                mismatchedFields.Add("firstName");
        }

        if (identity.BirthDate is { } birthDate)
        {
            checkedFields.Add("birthDate");
            bool yearMatches = code[6..8] ==
                (birthDate.Year % 100).ToString("D2", CultureInfo.InvariantCulture);
            bool monthMatches = code[8] == MonthLetters[birthDate.Month - 1];
            bool dayMatches = dayOfBirth == birthDate.Day;
            if (!yearMatches || !monthMatches || !dayMatches)
                mismatchedFields.Add("birthDate");
        }

        if (identity.Gender is 'M' or 'F')
        {
            checkedFields.Add("gender");
            char encodedGender = encodedDay > 40 ? 'F' : 'M';
            if (identity.Gender != encodedGender)
                mismatchedFields.Add("gender");
        }

        if (!string.IsNullOrWhiteSpace(identity.BirthPlaceCode))
        {
            checkedFields.Add("birthPlaceCode");
            if (identity.BirthPlaceCode.Trim().ToUpperInvariant() != code[11..15])
                mismatchedFields.Add("birthPlaceCode");
        }

        return (checkedFields, mismatchedFields);
    }

    internal static string DecodeOmocodia(string fiscalCode)
    {
        var characters = fiscalCode.ToCharArray();

        foreach (int position in NumericPositions)
        {
            if (OmocodiaDecode.TryGetValue(characters[position], out char decoded))
                characters[position] = decoded;
        }

        return new string(characters);
    }

    internal static string EncodeSurname(string surname)
    {
        var (consonants, vowels) = SplitLetters(NormalizeNamePart(surname));
        return PadCode(consonants + vowels);
    }

    internal static string EncodeGivenName(string givenName)
    {
        var (consonants, vowels) = SplitLetters(NormalizeNamePart(givenName));

        if (consonants.Length >= 4)
            return string.Concat(consonants[0], consonants[2], consonants[3]);

        return PadCode(consonants + vowels);
    }

    private static string PadCode(string letters) =>
        (letters.Length >= 3 ? letters[..3] : letters).PadRight(3, 'X');

    private static string NormalizeNamePart(string value)
    {
        var builder = new StringBuilder(value.Length);

        foreach (char c in value.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
                continue;

            char upper = char.ToUpperInvariant(c);
            if (upper is >= 'A' and <= 'Z')
                builder.Append(upper);
        }

        return builder.ToString();
    }

    private static (string Consonants, string Vowels) SplitLetters(string letters)
    {
        var consonants = new StringBuilder();
        var vowels = new StringBuilder();

        foreach (char letter in letters)
        {
            if (Vowels.Contains(letter))
                vowels.Append(letter);
            else
                consonants.Append(letter);
        }

        return (consonants.ToString(), vowels.ToString());
    }
}
