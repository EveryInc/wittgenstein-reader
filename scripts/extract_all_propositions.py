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
    text = text.replace("¬", "")  # Remove soft hyphens
    
    # Fix specific OCR errors
    text = text.replace("z.", "2.")  # Proposition 2
    text = text.replace("fi ve", "five")
    text = text.replace("teachin g", "teaching")
    text = text.replace("namin g", "naming")
    
    # Remove page headers/footers
    text = re.sub(r'\nPHILOSOPHICAL INVESTIGATIONS I\s*\n', '\n', text)
    text = re.sub(r'\n\d+[e®«»]\s*\n', '\n', text)
    text = re.sub(r'\n\d+\s*PHILOSOPHICAL INVESTIGATIONS I\s*\n', '\n', text)
    
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

def main():
    """Extract all propositions from the text file"""
    file_path = "/Users/danshipper/CascadeProjects/pi-reader/full-text/philosophical_investigations.txt"
    locations_file = "/Users/danshipper/CascadeProjects/pi-reader/scripts/proposition_locations.json"
    
    # Load proposition locations
    with open(locations_file, 'r') as f:
        locations = json.load(f)
    
    propositions = []
    for loc in locations:
        text = extract_proposition(file_path, loc['start'], loc['end'])
        propositions.append({
            "number": loc['number'],
            "text": text,
            "explanation": "",  # To be filled in later
            "section": "Part I"
        })
    
    # Save to JSON file
    output_path = "/Users/danshipper/CascadeProjects/pi-reader/src/data/propositions_complete.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(propositions, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(propositions)} propositions")
    print(f"Saved to {output_path}")
    
    # Show summary
    print(f"\nFirst proposition: {propositions[0]['number']}")
    print(f"Last proposition: {propositions[-1]['number']}")
    print(f"\nMissing propositions (sampling):")
    
    # Check for missing propositions in first 100
    extracted_nums = {int(p['number']) for p in propositions if p['number'].isdigit()}
    for i in range(1, 101):
        if i not in extracted_nums:
            print(f"  {i}")

if __name__ == "__main__":
    main()