from abc import ABC, abstractmethod
from typing import Any

class BaseAuth(ABC):
    """
    Abstract base class for authentication.
    """
    @abstractmethod
    def get_credentials(self) -> Any:
        """
        Return credentials object for API access.
        """
        pass 