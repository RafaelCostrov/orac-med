import enum


class TiposCliente(enum.Enum):
    CLIENTE = "cliente"
    CREDENCIADO = "credenciado"
    SERVICO_PRESTADO = "servico_prestado"
    PARTICULAR = "particular"

    def __str__(self):
        return str(self.value)
