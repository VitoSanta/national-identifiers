using NationalIdentifiers.Core;

namespace NationalIdentifiers.Tests;

public class TaxIdValidatorTests
{
    private static readonly TaxIdValidator V = new();

    [Fact]
    public void SupportedCountries_ArePublicSortedAndReadOnly()
    {
        Assert.Equal(195, V.SupportedCountries.Count);
        Assert.Equal(V.SupportedCountries.Order(), V.SupportedCountries);
        Assert.Contains("IT", V.SupportedCountries);
        Assert.Contains("TJ", V.SupportedCountries);
        Assert.Contains("VC", V.SupportedCountries);
        Assert.Contains("PW", V.SupportedCountries);
        Assert.Contains("PA", V.SupportedCountries);
        Assert.Contains("FM", V.SupportedCountries);
        Assert.Contains("SD", V.SupportedCountries);
        Assert.Contains("LB", V.SupportedCountries);
        Assert.Contains("SR", V.SupportedCountries);
        Assert.Contains("CD", V.SupportedCountries);
        Assert.DoesNotContain("XX", V.SupportedCountries);
        Assert.True(TaxIdCountries.IsSupported(" it "));
        Assert.False(TaxIdCountries.IsSupported("XX"));
        Assert.Throws<NotSupportedException>(
            () => ((IList<string>)V.SupportedCountries).Add("TD"));
    }

    [Fact]
    public void SupportedTerritories_ArePublicSortedAndReadOnly()
    {
        Assert.Equal(["FO", "GG", "GL", "HK", "JE", "PR", "TW"], V.SupportedTerritories);
        Assert.DoesNotContain(V.SupportedTerritories, V.SupportedCountries.Contains);
        Assert.True(TaxIdTerritories.IsSupported(" hk "));
        Assert.False(TaxIdTerritories.IsSupported("IT"));
        Assert.Throws<NotSupportedException>(
            () => ((IList<string>)V.SupportedTerritories).Add("MO"));
    }

    [Fact]
    public void SupportedVatCountries_ArePublicSortedAndReadOnly()
    {
        Assert.Equal([
                "AR", "AT", "AU", "BE", "BG", "CH", "CL", "CO", "CY", "CZ",
                "DE", "DK", "EE", "ES", "FI", "FR", "GB", "GR", "HR", "HU",
                "IE", "IL", "IT", "LT", "LU", "LV", "MT", "NL", "NO", "PL",
                "PT", "RO", "RU", "SE", "SI", "SK"
            ],
            V.SupportedVatCountries);
        Assert.True(VatCountries.IsSupported(" fr "));
        Assert.True(VatCountries.IsSupported("ES"));
        Assert.False(VatCountries.IsSupported("US"));
        Assert.Throws<NotSupportedException>(
            () => ((IList<string>)V.SupportedVatCountries).Add("ES"));
    }

    [Fact]
    public void SupportedCompanyTaxCountries_ArePublicAndReadOnly()
    {
        Assert.Equal(["AU", "BR", "CN", "IN", "NO", "NZ"], V.SupportedCompanyTaxCountries);
        Assert.True(CompanyTaxCountries.IsSupported(" br "));
        Assert.False(CompanyTaxCountries.IsSupported("DE"));
        Assert.Throws<NotSupportedException>(
            () => ((IList<string>)V.SupportedCompanyTaxCountries).Add("US"));
    }

    [Fact]
    public void Territories()
    {
        Ok("HK", "A123456(3)");
        Err("HK", "A123456(4)", ValidationErrorCode.InvalidChecksum);
        Ok("TW", "A123456789");
        Err("TW", "A123456788", ValidationErrorCode.InvalidChecksum);
        Ok("GL", "010101-1234", ValidationLevel.Format);
        Ok("FO", "010101-1234", ValidationLevel.Format);
        Ok("PR", "123-45-6789", ValidationLevel.Format);
        Err("PR", "000-45-6789", ValidationErrorCode.InvalidFormat);
    }

    private static void Ok(string cc, string input, ValidationLevel level = ValidationLevel.Checksum)
    {
        var r = V.Validate(cc, input);
        Assert.True(r.IsValid, $"{cc} '{input}': expected valid but got {r.Error}");
        Assert.Equal(level, r.ValidationLevel);
    }

    private static void OkNorm(string cc, string input, string norm, ValidationLevel level = ValidationLevel.Format)
    {
        var r = V.Validate(cc, input);
        Assert.True(r.IsValid, $"{cc} '{input}': expected valid but got {r.Error}");
        Assert.Equal(norm, r.NormalizedValue);
        Assert.Equal(level, r.ValidationLevel);
    }

    private static void Err(string cc, string? input, ValidationErrorCode code)
    {
        var r = V.Validate(cc, input);
        Assert.False(r.IsValid, $"{cc} '{input}': expected {code} but got valid");
        Assert.Equal(code, r.Error);
    }

    // ---- Europe: checksum ----

    [Fact]
    public void Italy()
    {
        Ok("IT", "RSSMRA85T10A562S");
        Err("IT", "RSSMRA85T10A562A", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Italy_VatNumber()
    {
        Ok("IT", "00743110157");
        Ok("IT", "00743110157".Insert(5, " "));
        Err("IT", "00743110158", ValidationErrorCode.InvalidChecksum);
        Err("IT", "0074311015A", ValidationErrorCode.InvalidFormat);
        Err("IT", "00000000000", ValidationErrorCode.InvalidFormat);
        Err("IT", "007431101", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Policy_MapsResultsToOutcomes()
    {
        Assert.Equal(TaxIdCheckOutcome.Accept, TaxIdPolicy.Evaluate(V.Validate("IT", "RSSMRA85T10A562S")));
        Assert.Equal(TaxIdCheckOutcome.Accept, TaxIdPolicy.Evaluate(V.Validate("IT", "00743110157")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("IT", "RSSMRA85T10A562A")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("IT", "RSSMRA85")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("IT", "")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("SO", "12")));
        Assert.Equal(TaxIdCheckOutcome.Accept, TaxIdPolicy.Evaluate(V.Validate("SO", "12345678")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("AE", "123456789")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("XX", "123456789")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("HK", "A123456")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("PR", "123")));
    }

    [Fact]
    public void Policy_Uses_Value_Specific_Metadata_For_Mixed_Validation_Levels()
    {
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("CZ", "531332/123")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("CZ", "800101/0007")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("SK", "531332/123")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("SK", "800101/0007")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("ID", "3173013213990001")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("ID", "123456789012345")));
        Assert.Equal(TaxIdCheckOutcome.Warn, TaxIdPolicy.Evaluate(V.Validate("SG", "M1234567!")));
        Assert.Equal(TaxIdCheckOutcome.Block, TaxIdPolicy.Evaluate(V.Validate("SG", "S1234567A")));
    }

    [Fact]
    public void Spain()
    {
        Ok("ES", "12345678Z");
        Ok("ES", "X1234567L");
        Err("ES", "12345678A", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void France()
    {
        Ok("FR", "3023217600053");
        Err("FR", "3023217600054", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Portugal()
    {
        Ok("PT", "123456789");
        Err("PT", "123456788", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Greece()
    {
        Ok("GR", "094259216");
        Err("GR", "094259217", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Belgium()
    {
        Ok("BE", "85.07.30-033.28");
        Err("BE", "85073003329", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Croatia()
    {
        Ok("HR", "12345678903");
        Err("HR", "12345678904", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Poland()
    {
        Ok("PL", "44051401458");
        Err("PL", "44051401459", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Finland()
    {
        Ok("FI", "131052-308T");
        Err("FI", "131052-308A", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Norway()
    {
        Ok("NO", "01010100050");
        Err("NO", "01010100051", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Sweden()
    {
        Ok("SE", "811228-9874");
        Err("SE", "811228-9875", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Iceland()
    {
        Ok("IS", "120174-0029");
        Err("IS", "120174-0039", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Estonia()
    {
        Ok("EE", "37605030299");
        Err("EE", "37605030298", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Latvia()
    {
        Ok("LV", "010190-12349");
        Ok("LV", "320000-12340");
        Err("LV", "320000-12341", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Lithuania()
    {
        Ok("LT", "38409152012");
        Err("LT", "38409152013", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Netherlands()
    {
        Ok("NL", "123456782");
        Err("NL", "123456783", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Czechia()
    {
        Ok("CZ", "800101/0006");
        Err("CZ", "800101/0007", ValidationErrorCode.InvalidChecksum);
        Ok("CZ", "530101/123", ValidationLevel.Format);
    }

    [Fact]
    public void Slovakia()
    {
        Ok("SK", "800101/0006");
        Err("SK", "800101/0007", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Slovenia()
    {
        Ok("SI", "12345679");
        Err("SI", "12345678", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Germany()
    {
        Ok("DE", "12345678911");
        Err("DE", "12345678912", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Switzerland()
    {
        Ok("CH", "756.1234.5678.97");
        Err("CH", "756.1234.5678.98", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Hungary()
    {
        Ok("HU", "8123456786");
        Err("HU", "8123456787", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Romania()
    {
        Ok("RO", "1960523420017");
        Err("RO", "1960523420018", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Bulgaria()
    {
        Ok("BG", "0041010002");
        Err("BG", "0041010003", ValidationErrorCode.InvalidChecksum);
        Err("BG", "0053010000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Serbia()
    {
        Ok("RS", "0101006710000");
        Err("RS", "0101006710001", ValidationErrorCode.InvalidChecksum);
        Err("RS", "0101006210008", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Montenegro()
    {
        Ok("ME", "0101006210008");
        Err("ME", "0101006210009", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void NorthMacedonia()
    {
        Ok("MK", "0101006410007");
        Err("MK", "0101006410008", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void BosniaHerzegovina()
    {
        Ok("BA", "0101006170006");
        Err("BA", "0101006170007", ValidationErrorCode.InvalidChecksum);
        Err("BA", "0101006210008", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Turkey()
    {
        Ok("TR", "10000000146");
        Err("TR", "10000000147", ValidationErrorCode.InvalidChecksum);
        Err("TR", "00000000146", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Ireland()
    {
        Ok("IE", "1234567T");
        Ok("IE", "1234567TW");
        Err("IE", "1234567A", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Luxembourg()
    {
        Ok("LU", "2000010100125");
        Err("LU", "2000010100126", ValidationErrorCode.InvalidChecksum);
        Err("LU", "2000023000125", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Russia()
    {
        Ok("RU", "7728168971");
        Err("RU", "7728168972", ValidationErrorCode.InvalidChecksum);
        Ok("RU", "500100732259");
        Err("RU", "500100732258", ValidationErrorCode.InvalidChecksum);
    }

    // ---- Europe: format-only ----

    [Fact]
    public void Denmark()
    {
        Ok("DK", "010101-1234", ValidationLevel.Format);
        Err("DK", "310299-1234", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Austria()
    {
        OkNorm("AT", "12-345/6789", "123456789");
    }

    [Fact]
    public void Albania()
    {
        Ok("AL", "K30315001A", ValidationLevel.Format);
        Err("AL", "K30230001A", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Moldova()
    {
        OkNorm("MD", "2002001000001", "2002001000001");
        Err("MD", "0000000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Ukraine()
    {
        OkNorm("UA", "1234567890", "1234567890");
        Err("UA", "123456789A", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Cyprus()
    {
        OkNorm("CY", "12345678T", "12345678T");
        Err("CY", "123456789", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Malta()
    {
        OkNorm("MT", "1234567M", "1234567M");
        Err("MT", "1234567X", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Liechtenstein()
    {
        OkNorm("LI", "000247681888", "000247681888");
        Err("LI", "000000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Andorra()
    {
        OkNorm("AD", "F123456Z", "F123456Z");
        Err("AD", "F000000Z", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void UnitedKingdom()
    {
        OkNorm("GB", "AB123456C", "AB123456C");
        OkNorm("GB", "1234567890", "1234567890");
        Err("GB", "AB123456E", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Belarus()
    {
        OkNorm("BY", "123456789", "123456789");
        OkNorm("BY", "AB1234567", "AB1234567");
        Err("BY", "12345678", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void SanMarino()
    {
        OkNorm("SM", "123456789", "123456789");
        OkNorm("SM", "12345", "12345");
        OkNorm("SM", "SM12345", "SM12345");
        Err("SM", "1234", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Monaco()
    {
        OkNorm("MC", "FR12345678901", "FR12345678901");
        OkNorm("MC", "123456789", "123456789");
        Err("MC", "1234", ValidationErrorCode.InvalidFormat);
    }

    // ---- Americas: checksum ----

    [Fact]
    public void Canada()
    {
        Ok("CA", "046454286");
        Err("CA", "046454287", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Brazil()
    {
        Ok("BR", "11144477735");
        Err("BR", "11144477736", ValidationErrorCode.InvalidChecksum);
        Err("BR", "00000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Mexico()
    {
        Ok("MX", "GODE561231GR8");
        Err("MX", "GODE561231GR9", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Argentina()
    {
        Ok("AR", "20267565393");
        Err("AR", "20267565394", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Chile()
    {
        Ok("CL", "123456785");
        Ok("CL", "1111122K");
        Err("CL", "123456786", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Colombia()
    {
        Ok("CO", "8903215670");
        Err("CO", "8903215671", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Peru()
    {
        Ok("PE", "100000008");
        Ok("PE", "20100000009");
        Err("PE", "20100000008", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Uruguay()
    {
        Ok("UY", "12345672");
        Err("UY", "12345673", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Venezuela()
    {
        Ok("VE", "J070133805");
        Err("VE", "J070133806", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Ecuador()
    {
        Ok("EC", "1714616123");
        Ok("EC", "1714616123001");
        Err("EC", "1714616124", ValidationErrorCode.InvalidChecksum);
        Err("EC", "9914616123", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void DominicanRepublic()
    {
        Ok("DO", "00100082700");
        Err("DO", "00100082701", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Paraguay()
    {
        Ok("PY", "3966931-9");
        Err("PY", "39669318", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Guatemala()
    {
        Ok("GT", "3602978-5");
        Ok("GT", "576937K");
        Err("GT", "36029786", ValidationErrorCode.InvalidChecksum);
    }

    // ---- Americas: format-only ----

    [Fact]
    public void UnitedStates()
    {
        OkNorm("US", "123456789", "123456789");
        Err("US", "000456789", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void CostaRica()
    {
        Ok("CR", "123456789", ValidationLevel.Format);
        Err("CR", "023456789", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void ElSalvador()
    {
        Ok("SV", "0614-241287-102-5", ValidationLevel.Format);
        Err("SV", "0614-321287-102-5", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Nicaragua()
    {
        Ok("NI", "001-241287-1234A", ValidationLevel.Format);
        Err("NI", "001-321287-1234A", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Cuba()
    {
        OkNorm("CU", "90010112345", "90010112345");
        Err("CU", "90130112345", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Bolivia()
    {
        Ok("BO", "1234567", ValidationLevel.Format);
        Ok("BO", "1234567890", ValidationLevel.Format);
        Err("BO", "0000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Barbados()
    {
        Ok("BB", "1234567890123", ValidationLevel.Format);
        Err("BB", "0000000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Belize()
    {
        Ok("BZ", "123456", ValidationLevel.Format);
        Err("BZ", "000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Guyana()
    {
        Ok("GY", "123456789", ValidationLevel.Format);
        Err("GY", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Honduras()
    {
        Ok("HN", "08011990123456", ValidationLevel.Format);
        Err("HN", "00000000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Jamaica()
    {
        Ok("JM", "123456789", ValidationLevel.Format);
        Err("JM", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void TrinidadAndTobago()
    {
        Ok("TT", "1234567890", ValidationLevel.Format);
        Err("TT", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    // ---- Asia: checksum ----

    [Fact]
    public void China()
    {
        Ok("CN", "11010519491231002X");
        Err("CN", "110105194912310021", ValidationErrorCode.InvalidChecksum);
        Err("CN", "110105194913310029", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Israel()
    {
        Ok("IL", "123456782");
        Err("IL", "123456783", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Japan()
    {
        Ok("JP", "123456789018");
        Err("JP", "123456789019", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Singapore()
    {
        Ok("SG", "S1234567D");
        Err("SG", "S1234567A", ValidationErrorCode.InvalidChecksum);
        OkNorm("SG", "M1234567X", "M1234567X");
    }

    [Fact]
    public void Thailand()
    {
        Ok("TH", "1101700230708");
        Err("TH", "1101700230709", ValidationErrorCode.InvalidChecksum);
        Err("TH", "0101700230708", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Indonesia()
    {
        Ok("ID", "01.300.066.6-091.000");
        Err("ID", "013000667091000", ValidationErrorCode.InvalidChecksum);
        OkNorm("ID", "3171011708450001", "3171011708450001");
        Ok("ID", "3171015708450001", ValidationLevel.Format);
        Err("ID", "3171011713450001", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Kazakhstan()
    {
        Ok("KZ", "900101300007");
        Err("KZ", "900101300008", ValidationErrorCode.InvalidChecksum);
        Err("KZ", "901301300007", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Iran()
    {
        Ok("IR", "1234567891");
        Err("IR", "1234567892", ValidationErrorCode.InvalidChecksum);
        Err("IR", "1111111111", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Palestine()
    {
        Ok("PS", "123456782");
        Err("PS", "123456783", ValidationErrorCode.InvalidChecksum);
    }

    // ---- Asia: format-only ----

    [Fact]
    public void India()
    {
        OkNorm("IN", "ABCPE1234F", "ABCPE1234F");
        Err("IN", "ABCXE1234F", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void SouthKorea()
    {
        OkNorm("KR", "900101-1234567", "9001011234567");
        Err("KR", "901301-1234567", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Kyrgyzstan()
    {
        OkNorm("KG", "10101199000001", "10101199000001");
        Err("KG", "10113199000001", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Malaysia()
    {
        OkNorm("MY", "850101-14-5678", "850101145678");
        Err("MY", "851301145678", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Philippines()
    {
        OkNorm("PH", "123456789", "123456789");
        Ok("PH", "123456789000", ValidationLevel.Format);
        Err("PH", "12345678", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Pakistan()
    {
        OkNorm("PK", "1234512345671", "1234512345671");
        Ok("PK", "1234567", ValidationLevel.Format);
        Err("PK", "0234512345671", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Vietnam()
    {
        OkNorm("VN", "0123456789", "0123456789");
        Ok("VN", "012345678901", ValidationLevel.Format);
        Err("VN", "012345678", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Georgia()
    {
        OkNorm("GE", "12345678901", "12345678901");
        Err("GE", "1234567890", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void SriLanka()
    {
        OkNorm("LK", "790930622V", "790930622V");
        Ok("LK", "199012300123", ValidationLevel.Format);
        Err("LK", "794430622V", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Uzbekistan()
    {
        OkNorm("UZ", "30101901234567", "30101901234567");
        Err("UZ", "30113901234567", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Mongolia()
    {
        Ok("MN", "УБ90103112", ValidationLevel.Format);
        Err("MN", "УБ90323112", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Armenia()
    {
        Ok("AM", "1234567890", ValidationLevel.Format);
        Err("AM", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Azerbaijan()
    {
        Ok("AZ", "1234567890", ValidationLevel.Format);
        Err("AZ", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Bangladesh()
    {
        Ok("BD", "123456789012", ValidationLevel.Format);
        Err("BD", "000000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Bhutan()
    {
        Ok("BT", "12345678901", ValidationLevel.Format);
        Err("BT", "00000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Cambodia()
    {
        Ok("KH", "123456789", ValidationLevel.Format);
        Ok("KH", "1234567890", ValidationLevel.Format);
        Err("KH", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Iraq()
    {
        Ok("IQ", "377819054", ValidationLevel.Format);
        Err("IQ", "000000000", ValidationErrorCode.InvalidFormat);
        Err("IQ", "12345678", ValidationErrorCode.InvalidLength);
        Err("IQ", "1234567890", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Afghanistan()
    {
        OkNorm("AF", "1234-5678-90123", "1234567890123");
        Err("AF", "0000000000000", ValidationErrorCode.InvalidFormat);
        Err("AF", "123456789012", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Haiti()
    {
        OkNorm("HT", "123-456-7890", "1234567890");
        Err("HT", "0000000000", ValidationErrorCode.InvalidFormat);
        Err("HT", "123456789", ValidationErrorCode.InvalidLength);
        Err("HT", "12345678901", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Tajikistan()
    {
        OkNorm("TJ", "123-456-789", "123456789");
        Err("TJ", "000000000", ValidationErrorCode.InvalidFormat);
        Err("TJ", "12345678", ValidationErrorCode.InvalidLength);
        Err("TJ", "1234567890", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Jordan()
    {
        Ok("JO", "123456789", ValidationLevel.Format);
        Err("JO", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Maldives()
    {
        Ok("MV", "1099060", ValidationLevel.Format);
        Err("MV", "0000000", ValidationErrorCode.InvalidFormat);
        Err("MV", "123456", ValidationErrorCode.InvalidLength);
        Err("MV", "12345678", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Nepal()
    {
        Ok("NP", "123456789", ValidationLevel.Format);
        Err("NP", "000000000", ValidationErrorCode.InvalidFormat);
    }

    // ---- Africa: checksum ----

    [Fact]
    public void SouthAfrica()
    {
        Ok("ZA", "0001339050");
        Err("ZA", "0001339051", ValidationErrorCode.InvalidChecksum);
        Err("ZA", "4001339050", ValidationErrorCode.InvalidFormat);
        Ok("ZA", "9405105678082");
        Err("ZA", "9405105678083", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void CapeVerde()
    {
        Ok("CV", "501442600");
        Err("CV", "501442601", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Guinea()
    {
        Ok("GN", "693-770-885");
        Err("GN", "693770880", ValidationErrorCode.InvalidChecksum);
    }

    [Fact]
    public void Senegal()
    {
        Ok("SN", "306 7221");
        Ok("SN", "3067221 2G2");
        Err("SN", "3067222", ValidationErrorCode.InvalidChecksum);
        Err("SN", "3067221 9G2", ValidationErrorCode.InvalidFormat);
    }

    // ---- Africa: format-only ----

    [Fact]
    public void Tunisia()
    {
        Ok("TN", "1234567/A/M/000", ValidationLevel.Format);
        Err("TN", "0000000/A/M/000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Algeria()
    {
        Ok("DZ", "408 020 000 150 039", ValidationLevel.Format);
        Ok("DZ", "41201600000606600001", ValidationLevel.Format);
        Err("DZ", "12345", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Morocco()
    {
        Ok("MA", "12345678", ValidationLevel.Format);
        Err("MA", "00000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Egypt()
    {
        Ok("EG", "123456789", ValidationLevel.Format);
        Err("EG", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Ghana()
    {
        Ok("GH", "GHA1234567890", ValidationLevel.Format);
        Err("GH", "GHA12345A7890", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Kenya()
    {
        Ok("KE", "A123456789B", ValidationLevel.Format);
        Err("KE", "B123456789B", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Mauritius()
    {
        Ok("MU", "12345678", ValidationLevel.Format);
        Err("MU", "00000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Nigeria()
    {
        Ok("NG", "1234567890", ValidationLevel.Format);
        Ok("NG", "123456780001", ValidationLevel.Format);
        Err("NG", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Rwanda()
    {
        Ok("RW", "123456789", ValidationLevel.Format);
        Err("RW", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Tanzania()
    {
        Ok("TZ", "123456789", ValidationLevel.Format);
        Ok("TZ", "1234567890", ValidationLevel.Format);
        Err("TZ", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Uganda()
    {
        Ok("UG", "1234567890", ValidationLevel.Format);
        Err("UG", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Zambia()
    {
        Ok("ZM", "1234567890", ValidationLevel.Format);
        Err("ZM", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Angola()
    {
        Ok("AO", "1234567890", ValidationLevel.Format);
        Err("AO", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Botswana()
    {
        Ok("BW", "123456789", ValidationLevel.Format);
        Err("BW", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Ethiopia()
    {
        Ok("ET", "1234567890", ValidationLevel.Format);
        Err("ET", "0000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Mozambique()
    {
        Ok("MZ", "123456789", ValidationLevel.Format);
        Err("MZ", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Namibia()
    {
        Ok("NA", "123456789", ValidationLevel.Format);
        Err("NA", "000000000", ValidationErrorCode.InvalidFormat);
    }

    // ---- Oceania ----

    [Fact]
    public void Australia()
    {
        Ok("AU", "123456782");
        Err("AU", "123456783", ValidationErrorCode.InvalidChecksum);
        Err("AU", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void NewZealand()
    {
        Ok("NZ", "49-091-850");
        Err("NZ", "49091851", ValidationErrorCode.InvalidChecksum);
        Err("NZ", "999999999", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Fiji()
    {
        Ok("FJ", "123456789", ValidationLevel.Format);
        Err("FJ", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void PapuaNewGuinea()
    {
        Ok("PG", "123456789", ValidationLevel.Format);
        Err("PG", "000000000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Samoa()
    {
        Ok("WS", "70004", ValidationLevel.Format);
        Ok("WS", "11001", ValidationLevel.Format);
        Ok("WS", "123456789", ValidationLevel.Format);
        Err("WS", "0000", ValidationErrorCode.InvalidLength);
        Err("WS", "1234567890", ValidationErrorCode.InvalidLength);
        Err("WS", "00000", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Dominica()
    {
        Ok("DM", "123456", ValidationLevel.Format);
        Ok("DM", "42", ValidationLevel.Format);
        Err("DM", "000000", ValidationErrorCode.InvalidFormat);
        Err("DM", "1234567", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Grenada()
    {
        OkNorm("GD", "123-456", "123456");
        Err("GD", "000000", ValidationErrorCode.InvalidFormat);
        Err("GD", "12345", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void MarshallIslands()
    {
        OkNorm("MH", "04-086123", "04086123");
        Err("MH", "05-086123", ValidationErrorCode.InvalidFormat);
        Err("MH", "04000000", ValidationErrorCode.InvalidFormat);
        Err("MH", "04-08612", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Palau()
    {
        OkNorm("PW", "006-123456", "006123456");
        Err("PW", "00612345A", ValidationErrorCode.InvalidFormat);
        Err("PW", "000000000", ValidationErrorCode.InvalidFormat);
        Err("PW", "00612345", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Panama()
    {
        OkNorm("PA", "8-340-1234", "83401234");
        Ok("PA", "E-8-340-1234", ValidationLevel.Format);
        Ok("PA", "8-PE-340-1234", ValidationLevel.Format);
        Err("PA", "8-340-1234-5", ValidationErrorCode.InvalidFormat);
        Err("PA", "0-000-0000", ValidationErrorCode.InvalidFormat);
        Err("PA", "83401234", ValidationErrorCode.InvalidFormat);
    }

    [Fact]
    public void Micronesia()
    {
        OkNorm("FM", "12-345678", "12345678");
        Err("FM", "1234567A", ValidationErrorCode.InvalidFormat);
        Err("FM", "00000000", ValidationErrorCode.InvalidFormat);
        Err("FM", "12-34567", ValidationErrorCode.InvalidLength);
    }

    [Fact]
    public void Sudan()
    {
        OkNorm("SD", "AB-123456", "AB123456");
        Err("SD", "1234/567", ValidationErrorCode.InvalidFormat);
        Err("SD", "", ValidationErrorCode.Empty);
    }

    [Fact]
    public void Lebanon()
    {
        OkNorm("LB", "123456-601", "123456601");
        Ok("LB", "123456", ValidationLevel.Format);
        Ok("LB", "123456-603", ValidationLevel.Format);
        Ok("LB", "123456-604", ValidationLevel.Format);
        Err("LB", "123456-602", ValidationErrorCode.InvalidFormat);
        Err("LB", "ABC123", ValidationErrorCode.InvalidFormat);
        Err("LB", "", ValidationErrorCode.Empty);
    }

    [Fact]
    public void Suriname()
    {
        Ok("SR", "1234567890", ValidationLevel.Format);
        Ok("SR", "1", ValidationLevel.Format);
        Err("SR", "12345678901", ValidationErrorCode.InvalidLength);
        Err("SR", "1234A", ValidationErrorCode.InvalidFormat);
        Err("SR", "12 34", ValidationErrorCode.InvalidFormat);
        Err("SR", "", ValidationErrorCode.Empty);
    }

    [Fact]
    public void DemocraticRepublicOfCongo()
    {
        OkNorm("CD", "a1011126f", "A1011126F");
        Err("CD", "A1011126", ValidationErrorCode.InvalidLength);
        Err("CD", "10111267F", ValidationErrorCode.InvalidFormat);
        Err("CD", "A10111267", ValidationErrorCode.InvalidFormat);
        Err("CD", "", ValidationErrorCode.Empty);
    }

    [Theory]
    [InlineData("BF", "12345678A", "123456789")]
    [InlineData("BI", "1234567890", "0000000000")]
    [InlineData("BJ", "1234567890123", "0000000000000")]
    [InlineData("CF", "1234567A", "12345678")]
    [InlineData("CG", "A1234567890123456", "12345678901234567")]
    [InlineData("CI", "1234567A", "12345678")]
    [InlineData("CM", "P123456789012A", "A123456789012P")]
    [InlineData("GA", "1234567890123", "0000000000000")]
    [InlineData("GW", "123456789", "000000000")]
    [InlineData("LA", "12345678901", "00000000000")]
    [InlineData("LC", "123456", "000000")]
    [InlineData("LR", "123456789", "000000000")]
    [InlineData("LS", "12345678", "00000000")]
    [InlineData("LY", "112345678901", "312345678901")]
    [InlineData("MG", "1234567890", "0000000000")]
    [InlineData("ML", "123456789A", "1234567890")]
    [InlineData("MM", "123456789", "000000000")]
    [InlineData("MR", "12345678", "00000000")]
    [InlineData("MW", "TP12345678", "1234567890")]
    [InlineData("SB", "123456789", "000000000")]
    [InlineData("SC", "122456789", "123456789")]
    [InlineData("SL", "12345678", "00000000")]
    [InlineData("SS", "123456789", "000000000")]
    [InlineData("ST", "123456789", "000000000")]
    [InlineData("SY", "12345678901", "00000000000")]
    [InlineData("SZ", "123456789", "000000000")]
    [InlineData("TG", "0123456789012", "4123456789012")]
    [InlineData("TL", "123456789", "000000000")]
    [InlineData("VC", "123456789", "12345A")]
    [InlineData("ZW", "1234567890", "0000000000")]
    [InlineData("TM", "123456789012", "000000000000")]
    [InlineData("GM", "1234567890", "0000000000")]
    [InlineData("KM", "8301149211", "0000000000")]
    [InlineData("GQ", "A0704885T", "A@704885T")]
    [InlineData("YE", "123456789", "000000000")]
    [InlineData("NE", "12345678", "00000000")]
    [InlineData("SO", "12345678", "00000000")]
    [InlineData("TD", "ABC12345", "ABC@1234")]
    [InlineData("DJ", "AB12345", "AB@1234")]
    [InlineData("ER", "1234567", "1234@56")]
    [InlineData("KI", "1234567", "5678@90")]
    [InlineData("TO", "1234567", "5678@90")]
    public void ExtendedFormatOnlyCountries(string country, string valid, string invalid)
    {
        Ok(country, valid, ValidationLevel.Format);
        Err(country, invalid, ValidationErrorCode.InvalidFormat);
    }

    // ---- Not applicable ----

    [Theory]
    [InlineData("AE")]
    [InlineData("AG")]
    [InlineData("BH")]
    [InlineData("BN")]
    [InlineData("BS")]
    [InlineData("KN")]
    [InlineData("KP")]
    [InlineData("KW")]
    [InlineData("NR")]
    [InlineData("OM")]
    [InlineData("QA")]
    [InlineData("SA")]
    [InlineData("VA")]
    [InlineData("VU")]
    [InlineData("TV")]
    public void NotApplicable_Countries_ReturnNotApplicableError(string country)
    {
        Err(country, "123456789", ValidationErrorCode.NotApplicable);
    }

    // ---- Edge cases ----

    [Fact]
    public void Empty_Input_ReturnsEmptyError()
    {
        Err("IT", "", ValidationErrorCode.Empty);
        Err("US", null, ValidationErrorCode.Empty);
    }

    [Fact]
    public void Unsupported_Country_ReturnsUnsupportedError()
    {
        var r = V.Validate("XX", "123456789");
        Assert.False(r.IsValid);
        Assert.Equal(ValidationErrorCode.UnsupportedCountry, r.Error);
    }

    [Theory]
    [InlineData(null, "")]
    [InlineData("", "")]
    [InlineData("   ", "")]
    [InlineData(" xx ", "XX")]
    public void Invalid_Country_ReturnsUnsupportedError(string? country, string normalizedCountry)
    {
        var r = V.Validate(country, "123456789");

        Assert.False(r.IsValid);
        Assert.Equal(normalizedCountry, r.Country);
        Assert.Equal(ValidationErrorCode.UnsupportedCountry, r.Error);
    }
}
