import re


def clean_text(text: str) -> str:
    """Mirror the notebook's light text cleaning pipeline as closely as possible."""
    text = re.sub(r"<.*?>", "", text)
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    return text
