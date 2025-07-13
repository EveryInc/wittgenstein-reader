#!/usr/bin/env python3

import json
import re

def clean_text(text):
    """Clean up OCR artifacts and formatting issues"""
    # Fix common OCR errors
    text = text.replace("—", "--")
    text = text.replace("'", "'")
    text = text.replace("'", "'") 
    text = text.replace(""", '"')
    text = text.replace(""", '"')
    text = text.replace("§", "§")
    
    # Remove page headers/footers
    text = re.sub(r'\nPHILOSOPHICAL INVESTIGATIONS I\s*\n', '\n', text)
    text = re.sub(r'\n\d+[e®«]\s*\n', '\n', text)
    
    # Clean up whitespace
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    text = text.strip()
    
    return text

def extract_proposition(file_path, start_line, end_line):
    """Extract text from specific line range"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Extract the lines (adjust for 0-based indexing)
    proposition_lines = lines[start_line-1:end_line]
    
    # Join and clean
    text = ''.join(proposition_lines)
    text = clean_text(text)
    
    return text

def parse_propositions():
    """Parse all propositions from the text file"""
    file_path = "/Users/danshipper/CascadeProjects/pi-reader/full-text/philosophical_investigations.txt"
    
    # Define proposition locations
    # This is a sample - you'll need to complete this based on the full parsing
    propositions = [
        {"number": "1", "start": 224, "end": 289},
        {"number": "2", "start": 290, "end": 305},
        {"number": "3", "start": 306, "end": 318},
        {"number": "4", "start": 319, "end": 335},
        {"number": "5", "start": 336, "end": 345},
        {"number": "6", "start": 346, "end": 392},
        {"number": "7", "start": 393, "end": 412},
        {"number": "8", "start": 413, "end": 426},
        {"number": "9", "start": 427, "end": 450},
        {"number": "10", "start": 451, "end": 475},
        {"number": "11", "start": 476, "end": 485},
        {"number": "12", "start": 495, "end": 503},
        {"number": "13", "start": 504, "end": 510},
        {"number": "14", "start": 511, "end": 519},
        {"number": "15", "start": 520, "end": 528},
        {"number": "16", "start": 529, "end": 540},
        {"number": "17", "start": 545, "end": 553},
        {"number": "18", "start": 554, "end": 566},
        {"number": "19", "start": 567, "end": 605},
        {"number": "20", "start": 606, "end": 645},
        {"number": "21", "start": 662, "end": 683},
        {"number": "22", "start": 684, "end": 722},
        {"number": "23", "start": 724, "end": 785}
    ]
    
    results = []
    for prop in propositions:
        text = extract_proposition(file_path, prop["start"], prop["end"])
        results.append({
            "number": prop["number"],
            "text": text,
            "explanation": "",  # To be filled in later
            "section": "Part I"
        })
    
    return results

if __name__ == "__main__":
    propositions = parse_propositions()
    
    # Save to JSON file
    output_path = "/Users/danshipper/CascadeProjects/pi-reader/src/data/propositions.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(propositions, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(propositions)} propositions")
    print(f"Saved to {output_path}")