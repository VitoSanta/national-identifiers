namespace NationalIdentifiers.Core;

/// <summary>Identifier family requested for validation.</summary>
public enum IdentifierType
{
    /// <summary>Personal tax identifier or functional personal TIN.</summary>
    TaxIdPerson,

    /// <summary>Value-added tax registration number.</summary>
    Vat,

    /// <summary>Company or entity tax identifier.</summary>
    TaxIdCompany,
}
