using NationalIdentifiers.Core.Countries;

namespace NationalIdentifiers.Core;

/// <summary>Validates national tax identifiers for 195 countries.</summary>
public class TaxIdValidator : ITaxIdValidator
{
    /// <inheritdoc />
    public IReadOnlyList<string> SupportedCountries => TaxIdCountries.Supported;

    /// <inheritdoc />
    public IReadOnlyList<string> SupportedTerritories => TaxIdTerritories.Supported;

    /// <inheritdoc />
    public IReadOnlyList<string> SupportedVatCountries => VatCountries.Supported;

    /// <summary>Validates a national identifier for an ISO 3166-1 alpha-2 country code.</summary>
    /// <param name="country">The two-letter country code.</param>
    /// <param name="value">The identifier to normalize and validate.</param>
    /// <returns>The normalized validation result.</returns>
    public ValidationResult Validate(string? country, object? value)
    {
        var normalizedCountry = country?.Trim().ToUpperInvariant() ?? string.Empty;

        return normalizedCountry switch
        {
            "AD" => Andorra.Validate(value),
            "AE" => NotApplicable.Validate("AE", value),
            "AF" => Afghanistan.Validate(value),
            "AG" => NotApplicable.Validate("AG", value),
            "AL" => Albania.Validate(value),
            "AM" => Armenia.Validate(value),
            "AO" => Angola.Validate(value),
            "AR" => Argentina.Validate(value),
            "AT" => Austria.Validate(value),
            "AU" => Australia.Validate(value),
            "AZ" => Azerbaijan.Validate(value),
            "BA" => BosniaHerzegovina.Validate(value),
            "BB" => Barbados.Validate(value),
            "BD" => Bangladesh.Validate(value),
            "BE" => Belgium.Validate(value),
            "BF" => BurkinaFaso.Validate(value),
            "BG" => Bulgaria.Validate(value),
            "BH" => NotApplicable.Validate("BH", value),
            "BI" => Burundi.Validate(value),
            "BJ" => Benin.Validate(value),
            "BN" => NotApplicable.Validate("BN", value),
            "BO" => Bolivia.Validate(value),
            "BR" => Brazil.Validate(value),
            "BS" => NotApplicable.Validate("BS", value),
            "BT" => Bhutan.Validate(value),
            "BW" => Botswana.Validate(value),
            "BY" => Belarus.Validate(value),
            "BZ" => Belize.Validate(value),
            "CA" => Canada.Validate(value),
            "CD" => DemocraticRepublicOfCongo.Validate(value),
            "CF" => CentralAfricanRepublic.Validate(value),
            "CG" => RepublicOfCongo.Validate(value),
            "CH" => Switzerland.Validate(value),
            "CI" => CoteDIvoire.Validate(value),
            "CL" => Chile.Validate(value),
            "CM" => Cameroon.Validate(value),
            "CN" => China.Validate(value),
            "CO" => Colombia.Validate(value),
            "CR" => CostaRica.Validate(value),
            "CU" => Cuba.Validate(value),
            "CV" => CapeVerde.Validate(value),
            "CY" => Cyprus.Validate(value),
            "CZ" => Czechia.Validate(value),
            "DE" => Germany.Validate(value),
            "DJ" => Djibouti.Validate(value),
            "DK" => Denmark.Validate(value),
            "DM" => Dominica.Validate(value),
            "DO" => DominicanRepublic.Validate(value),
            "DZ" => Algeria.Validate(value),
            "EC" => Ecuador.Validate(value),
            "EE" => Estonia.Validate(value),
            "EG" => Egypt.Validate(value),
            "ER" => Eritrea.Validate(value),
            "ES" => Spain.Validate(value),
            "ET" => Ethiopia.Validate(value),
            "FI" => Finland.Validate(value),
            "FJ" => Fiji.Validate(value),
            "FM" => Micronesia.Validate(value),
            "FR" => France.Validate(value),
            "GA" => Gabon.Validate(value),
            "GB" => UnitedKingdom.Validate(value),
            "GD" => Grenada.Validate(value),
            "GE" => Georgia.Validate(value),
            "GH" => Ghana.Validate(value),
            "GM" => Gambia.Validate(value),
            "GN" => Guinea.Validate(value),
            "GQ" => EquatorialGuinea.Validate(value),
            "GR" => Greece.Validate(value),
            "GT" => Guatemala.Validate(value),
            "GW" => GuineaBissau.Validate(value),
            "GY" => Guyana.Validate(value),
            "HN" => Honduras.Validate(value),
            "HR" => Croatia.Validate(value),
            "HT" => Haiti.Validate(value),
            "HU" => Hungary.Validate(value),
            "ID" => Indonesia.Validate(value),
            "IE" => Ireland.Validate(value),
            "IL" => Israel.Validate(value),
            "IN" => India.Validate(value),
            "IQ" => Iraq.Validate(value),
            "IR" => Iran.Validate(value),
            "IS" => Iceland.Validate(value),
            "IT" => Italy.Validate(value),
            "JM" => Jamaica.Validate(value),
            "JO" => Jordan.Validate(value),
            "JP" => Japan.Validate(value),
            "KE" => Kenya.Validate(value),
            "KG" => Kyrgyzstan.Validate(value),
            "KH" => Cambodia.Validate(value),
            "KI" => Kiribati.Validate(value),
            "KM" => Comoros.Validate(value),
            "KN" => NotApplicable.Validate("KN", value),
            "KP" => NotApplicable.Validate("KP", value),
            "KR" => SouthKorea.Validate(value),
            "KW" => NotApplicable.Validate("KW", value),
            "KZ" => Kazakhstan.Validate(value),
            "LA" => Laos.Validate(value),
            "LB" => Lebanon.Validate(value),
            "LC" => SaintLucia.Validate(value),
            "LI" => Liechtenstein.Validate(value),
            "LK" => SriLanka.Validate(value),
            "LR" => Liberia.Validate(value),
            "LS" => Lesotho.Validate(value),
            "LT" => Lithuania.Validate(value),
            "LU" => Luxembourg.Validate(value),
            "LV" => Latvia.Validate(value),
            "LY" => Libya.Validate(value),
            "MA" => Morocco.Validate(value),
            "MC" => Monaco.Validate(value),
            "MD" => Moldova.Validate(value),
            "ME" => Montenegro.Validate(value),
            "MG" => Madagascar.Validate(value),
            "MH" => MarshallIslands.Validate(value),
            "MK" => NorthMacedonia.Validate(value),
            "ML" => Mali.Validate(value),
            "MM" => Myanmar.Validate(value),
            "MN" => Mongolia.Validate(value),
            "MR" => Mauritania.Validate(value),
            "MT" => Malta.Validate(value),
            "MU" => Mauritius.Validate(value),
            "MV" => Maldives.Validate(value),
            "MW" => Malawi.Validate(value),
            "MX" => Mexico.Validate(value),
            "MY" => Malaysia.Validate(value),
            "MZ" => Mozambique.Validate(value),
            "NA" => Namibia.Validate(value),
            "NE" => Niger.Validate(value),
            "NG" => Nigeria.Validate(value),
            "NI" => Nicaragua.Validate(value),
            "NL" => Netherlands.Validate(value),
            "NO" => Norway.Validate(value),
            "NP" => Nepal.Validate(value),
            "NR" => NotApplicable.Validate("NR", value),
            "NZ" => NewZealand.Validate(value),
            "OM" => NotApplicable.Validate("OM", value),
            "PA" => Panama.Validate(value),
            "PE" => Peru.Validate(value),
            "PG" => PapuaNewGuinea.Validate(value),
            "PH" => Philippines.Validate(value),
            "PK" => Pakistan.Validate(value),
            "PL" => Poland.Validate(value),
            "PS" => Palestine.Validate(value),
            "PT" => Portugal.Validate(value),
            "PW" => Palau.Validate(value),
            "PY" => Paraguay.Validate(value),
            "QA" => NotApplicable.Validate("QA", value),
            "RO" => Romania.Validate(value),
            "RS" => Serbia.Validate(value),
            "RU" => Russia.Validate(value),
            "RW" => Rwanda.Validate(value),
            "SA" => NotApplicable.Validate("SA", value),
            "SB" => SolomonIslands.Validate(value),
            "SC" => Seychelles.Validate(value),
            "SD" => Sudan.Validate(value),
            "SE" => Sweden.Validate(value),
            "SG" => Singapore.Validate(value),
            "SI" => Slovenia.Validate(value),
            "SK" => Slovakia.Validate(value),
            "SL" => SierraLeone.Validate(value),
            "SM" => SanMarino.Validate(value),
            "SN" => Senegal.Validate(value),
            "SO" => Somalia.Validate(value),
            "SR" => Suriname.Validate(value),
            "SS" => SouthSudan.Validate(value),
            "ST" => SaoTome.Validate(value),
            "SV" => ElSalvador.Validate(value),
            "SY" => Syria.Validate(value),
            "SZ" => Eswatini.Validate(value),
            "TD" => Chad.Validate(value),
            "TG" => Togo.Validate(value),
            "TH" => Thailand.Validate(value),
            "TJ" => Tajikistan.Validate(value),
            "TL" => TimorLeste.Validate(value),
            "TM" => Turkmenistan.Validate(value),
            "TN" => Tunisia.Validate(value),
            "TO" => Tonga.Validate(value),
            "TR" => Turkey.Validate(value),
            "TT" => TrinidadTobago.Validate(value),
            "TV" => NotApplicable.Validate("TV", value),
            "TZ" => Tanzania.Validate(value),
            "UA" => Ukraine.Validate(value),
            "UG" => Uganda.Validate(value),
            "US" => UnitedStates.Validate(value),
            "UY" => Uruguay.Validate(value),
            "UZ" => Uzbekistan.Validate(value),
            "VA" => VaticanCity.Validate(value),
            "VC" => SaintVincentAndTheGrenadines.Validate(value),
            "VE" => Venezuela.Validate(value),
            "VN" => Vietnam.Validate(value),
            "VU" => NotApplicable.Validate("VU", value),
            "WS" => Samoa.Validate(value),
            "YE" => Yemen.Validate(value),
            "ZA" => SouthAfrica.Validate(value),
            "ZM" => Zambia.Validate(value),
            "ZW" => Zimbabwe.Validate(value),
            _ => TaxIdTerritoryValidator.Validate(normalizedCountry, value)
        };
    }

    /// <inheritdoc />
    public ValidationResult Validate(string? country, IdentifierType type, object? value)
    {
        var normalizedCountry = country?.Trim().ToUpperInvariant() ?? string.Empty;

        if (type == IdentifierType.TaxIdPerson)
            return Validate(normalizedCountry, value) with { IdentifierType = type };

        ValidationResult? result = (normalizedCountry, type) switch
        {
            ("AT", IdentifierType.Vat) => EuropeanVat.Austria(value),
            ("AU", IdentifierType.Vat) => EuropeanVat.Australia(value),
            ("BE", IdentifierType.Vat) => EuropeanVat.Belgium(value),
            ("CH", IdentifierType.Vat) => EuropeanVat.Switzerland(value),
            ("CY", IdentifierType.Vat) => EuropeanVat.Cyprus(value),
            ("CZ", IdentifierType.Vat) => EuropeanVat.CzechRepublic(value),
            ("DE", IdentifierType.Vat) => EuropeanVat.Germany(value),
            ("DK", IdentifierType.Vat) => EuropeanVat.Denmark(value),
            ("EE", IdentifierType.Vat) => EuropeanVat.Estonia(value),
            ("ES", IdentifierType.Vat) => EuropeanVat.Spain(value),
            ("FI", IdentifierType.Vat) => EuropeanVat.Finland(value),
            ("FR", IdentifierType.Vat) => EuropeanVat.France(value),
            ("GB", IdentifierType.Vat) => EuropeanVat.UnitedKingdom(value),
            ("GR", IdentifierType.Vat) => EuropeanVat.Greece(value),
            ("HR", IdentifierType.Vat) => EuropeanVat.Croatia(value),
            ("HU", IdentifierType.Vat) => EuropeanVat.Hungary(value),
            ("IE", IdentifierType.Vat) => EuropeanVat.Ireland(value),
            ("IT", IdentifierType.Vat) => EuropeanVat.Italy(value),
            ("LT", IdentifierType.Vat) => EuropeanVat.Lithuania(value),
            ("LU", IdentifierType.Vat) => EuropeanVat.Luxembourg(value),
            ("LV", IdentifierType.Vat) => EuropeanVat.Latvia(value),
            ("MT", IdentifierType.Vat) => EuropeanVat.Malta(value),
            ("NL", IdentifierType.Vat) => EuropeanVat.Netherlands(value),
            ("NO", IdentifierType.Vat) => EuropeanVat.Norway(value),
            ("PL", IdentifierType.Vat) => EuropeanVat.Poland(value),
            ("PT", IdentifierType.Vat) => EuropeanVat.Portugal(value),
            ("RO", IdentifierType.Vat) => EuropeanVat.Romania(value),
            ("SE", IdentifierType.Vat) => EuropeanVat.Sweden(value),
            ("SI", IdentifierType.Vat) => EuropeanVat.Slovenia(value),
            ("SK", IdentifierType.Vat) => EuropeanVat.Slovakia(value),
            _ => null,
        };

        if (result is not null)
            return result with { IdentifierType = type };

        var countryKnown = TaxIdCountries.IsSupported(normalizedCountry)
            || TaxIdTerritories.IsSupported(normalizedCountry);
        return ValidationResult.Fail(
            normalizedCountry,
            TaxIdNormalizer.Normalize(value),
            countryKnown
                ? ValidationErrorCode.UnsupportedIdentifierType
                : ValidationErrorCode.UnsupportedCountry) with
            {
                IdentifierType = type
            };
    }
}
