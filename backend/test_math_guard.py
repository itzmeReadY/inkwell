import pytest
from math_guard import MathGuard

def test_extract_block_math():
    mg = MathGuard()
    text = "Here is some math: $$x^2 + y^2 = z^2$$"
    modified, eqs = mg.extract_math(text)
    assert modified == "Here is some math: ⟦EQ1⟧"
    assert "⟦EQ1⟧" in eqs
    assert eqs["⟦EQ1⟧"] == "$$x^2 + y^2 = z^2$$"

def test_extract_inline_math():
    mg = MathGuard()
    text = "Let $x = 5$."
    modified, eqs = mg.extract_math(text)
    assert modified == "Let ⟦EQ1⟧."
    assert "⟦EQ1⟧" in eqs
    assert eqs["⟦EQ1⟧"] == "$x = 5$"

def test_currency_false_positives():
    mg = MathGuard()
    # It should not match $5 or $10.
    text = "I paid $5 for this, and $10 for that."
    modified, eqs = mg.extract_math(text)
    assert modified == text
    assert len(eqs) == 0

def test_extract_bare_math():
    mg = MathGuard()
    text = "eigenvalue = lambda, Av = lambda v"
    modified, eqs = mg.extract_math(text)
    assert "⟦EQ1⟧" in modified
    assert "⟦EQ2⟧" in modified
    assert eqs["⟦EQ1⟧"] == "eigenvalue = lambda"
    assert eqs["⟦EQ2⟧"] == "Av = lambda v"

def test_reinsert_bare_math():
    mg = MathGuard()
    text = "Here is ⟦EQ1⟧."
    eqs = {"⟦EQ1⟧": "x = 5"}
    # Should wrap in $
    assert mg.reinsert_math(text, eqs) == "Here is $x = 5$."

def test_validate_placeholders():
    mg = MathGuard()
    text = "Here is ⟦EQ1⟧ and ⟦EQ2⟧."
    eqs = {"⟦EQ1⟧": "$x$", "⟦EQ2⟧": "$y$"}
    assert mg.validate_placeholders(text, eqs) == True

def test_validate_placeholders_missing():
    mg = MathGuard()
    text = "Here is ⟦EQ1⟧ only."
    eqs = {"⟦EQ1⟧": "$x$", "⟦EQ2⟧": "$y$"}
    assert mg.validate_placeholders(text, eqs) == False

def test_reinsert_math():
    mg = MathGuard()
    text = "Here is ⟦EQ1⟧."
    eqs = {"⟦EQ1⟧": "$x^2$"}
    assert mg.reinsert_math(text, eqs) == "Here is $x^2$."
