from __future__ import annotations

from enum import Enum
from typing import Dict

from app.game.models import Archetype


class RelationType(str, Enum):
    ALLY = "ally"
    COUNTER = "counter"
    NEUTRAL = "neutral"
    TRADE = "trade"


# Directed counter relation (R ⊆ A×A). If (a,b) in R, then a counters b.
COUNTERS = {
    (Archetype.FOXY, Archetype.OXY),
    (Archetype.BEAR, Archetype.FOXY),
    (Archetype.OXY, Archetype.BEAR),
}

# Owl can trade with anyone (including self for consistency in UI).
TRADE_WITH = {Archetype.OWL}


def get_relation(source: Archetype, target: Archetype) -> RelationType:
    if source == target:
        return RelationType.ALLY
    if (source, target) in COUNTERS:
        return RelationType.COUNTER
    if source in TRADE_WITH:
        return RelationType.TRADE
    return RelationType.NEUTRAL


def relation_matrix() -> Dict[Archetype, Dict[Archetype, RelationType]]:
    matrix: Dict[Archetype, Dict[Archetype, RelationType]] = {}
    for a in Archetype:
        row: Dict[Archetype, RelationType] = {}
        for b in Archetype:
            row[b] = get_relation(a, b)
        matrix[a] = row
    return matrix


def is_counter(source: Archetype, target: Archetype) -> bool:
    return (source, target) in COUNTERS


