import enum


class TiposUsuario(enum.Enum):
    ADMINISTRADOR = "administrador"
    GESTOR = "gestor"
    USUARIO = "usuario"

    def __str__(self):
        return str(self.value)
