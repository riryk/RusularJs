function localeProvider() {
    this.get = function () {
        return {
            Id: "en-us",
            NumberFormats: {
                DecimalSeparator: ".",
                GroupSeparator: ",",
                CurrencySymbol: "$"
            }
        };
    };
}
