import csv
from typing import List, Dict

def parse_csv(file_content: str) -> List[Dict[str, str]]:
    reader = csv.DictReader(file_content.splitlines())
    return [row for row in reader]
