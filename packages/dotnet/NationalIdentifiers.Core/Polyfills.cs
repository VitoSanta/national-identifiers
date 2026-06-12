#if NETSTANDARD2_0
// record types require IsExternalInit which is absent from netstandard2.0
namespace System.Runtime.CompilerServices
{
    internal static class IsExternalInit { }
}
#endif
