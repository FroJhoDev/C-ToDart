let generateClassForm = document.getElementById('generateClassForm');
let cleanDartInputBtn = document.getElementById('cleanDartInputBtn');
let copyDartClassBtn = document.getElementById('copyDartClassBtn');

generateClassForm.addEventListener('submit', function () {

    let classNameInput = document.getElementById('classNameInput');
    let cSharpClassInput = document.getElementById('cSharpClassInput');
    let generatedDartClassInput = document.getElementById('generatedDartClassInput')

    let dartClassGenerated = generateDartClass(cSharpClassInput.value, classNameInput.value);

    generatedDartClassInput.value = dartClassGenerated;

});

cleanDartInputBtn.addEventListener('click', function () {
    document.getElementById('generatedDartClassInput').value = '';
})

copyDartClassBtn.addEventListener('click', function () {

    let classToCopy = document.getElementById('generatedDartClassInput');

    classToCopy.select();
    classToCopy.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(classToCopy.value);

});

function pascalToSnakeCase(pascalString) {
    const snakeCaseString = pascalString.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase());
    return snakeCaseString.replace(/^_/, '');
}

function generateDartClass(csharpClass, classNewName) {
    const lines = csharpClass.split('\n');
    let className = '';
    let properties = [];
    let fileName = '';

    if (classNewName != undefined && classNewName != '') {
        className = classNewName;
    } else {
        // Encontrar o nome da classe
        for (const line of lines) {
            const classMatch = line.match(/public class (\w+) : \w+/);
            if (classMatch) {
                className = classMatch[1];
                break;
            }
        }
    }

    fileName = pascalToSnakeCase(className);

    // Lógica para analisar a string da classe C# e extrair as propriedades
    const propertiesRegex = /\[JsonProperty\("(.+)"\)\]\s+public\s+(\w+)\s+(\w+)\s+\{\s+get;\s+set;\s+\}/g;
    let match;

    while ((match = propertiesRegex.exec(csharpClass)) !== null) {
        const jsonKey = match[1];
        const type = match[2];
        const propertyName = match[3];

        properties.push({ jsonKey, type, propertyName });
    }

    // Gerar a classe Dart
    let dartCode = `import 'package:dependencies/dependencies.dart';

part '${fileName}_freezed.dart';
part '${fileName}.g.dart';

/// {@template ${fileName}}
/// ${className} model
/// {@endtemplate}

@freezed
class ${className} with _\$${className} {
    /// {@macro ${fileName}}
    factory ${className}({
`;

    for (const { jsonKey, type, propertyName } of properties) {
        dartCode += `   @JsonKey(name: '${jsonKey}') required ${type} ${propertyName.toLowerCase()},
    `;
    }

    dartCode += `}) = _\$${className};
    
    /// Transform json [Map] in a [${className}]
    factory ${className}.fromJson(Map<String, dynamic> json) => _\$${className}FromJson(json);
}
`;

    return dartCode;
}

// Exemplo da classe C#
const csharpCode = `
using Newtonsoft.Json;
using System;

namespace AmilMobile.Infrastructure.Networking.Response.TokenGuide
{
    public class OrderDentalResponse : AbstractResponse
    {
        [JsonProperty("numeroPedido")]
        public int OrderNumber { get; set; }

        [JsonProperty("token")]
        public string Token { get; set; }

        [JsonProperty("dataSolicitacao")]
        public DateTime RequestDate { get; set; }

        [JsonProperty("codigoStatusAutorizacaoBeneficiario")]
        public int StatusAuthorizationBeneficiaryCode { get; set; }

        [JsonProperty("statusAutorizacaoBeneficiario")]
        public string StatusAuthorizationBeneficiary { get; set; }

        [JsonProperty("codigoStatusAutorizacao")]
        public int StatusAuthorizationCode { get; set; }

        [JsonProperty("tipoAtendimento")]
        public string AttendanceType { get; set; }

        [JsonProperty("executante")]
        public string Performer { get; set; }

        [JsonProperty("tokenAtivo")]
        public string TokenActive { get; set; }

        [JsonProperty("motivo")]
        public string Reason { get; set; }

        [JsonProperty("motivoGlosa")]
        public string ReasonGlosa { get; set; }

        [JsonProperty("autorizadoParcialmente")]
        public string PartiallyAuthorized { get; set; }

        [JsonProperty("situacaoInterna")]
        public string InternalSituation { get; set; }

        [JsonProperty("pesquisaSatisfacao")]
        public bool HasSatisfactionSurvey { get; set; }
    }
}
`;

// console.log(generateDartClass(csharpCode));
