import enum


class TiposAtendimento(enum.Enum):
    ADMISSIONAL = "admissional"
    DEMISSIONAL = "demissional"
    PERIODICO = "periodico"
    MUDANCA_FUNCAO = "mudanca_funcao"
    RETORNO_TRABALHO = "retorno_trabalho"
    OUTROS = "outros"
