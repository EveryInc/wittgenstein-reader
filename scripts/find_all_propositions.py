#!/usr/bin/env python3

import re

def find_proposition_locations(file_path):
    """Find all proposition numbers and their line locations"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    propositions = []
    current_prop = None
    part_i_started = False
    
    for i, line in enumerate(lines):
        # Check if we've reached Part I
        if 'PART I' in line and not part_i_started:
            part_i_started = True
            # Look for proposition 1 which starts with "i."
            for j in range(i+1, min(i+20, len(lines))):
                if lines[j].strip().startswith('i.'):
                    current_prop = {
                        'number': '1',
                        'start': j + 1,
                        'end': None
                    }
                    break
            continue
        
        # Only look for propositions after Part I has started
        if not part_i_started:
            continue
            
        # Match numbered propositions (e.g., "2. That philosophical...")
        # Also handle OCR errors like "z." for "2."
        match = re.match(r'^(\d+)\.\s+[A-Z]', line)
        ocr_match = re.match(r'^z\.\s+', line)  # OCR error for "2."
        
        if ocr_match and current_prop and current_prop['number'] == '1':
            # This is proposition 2 with OCR error
            match = True
            prop_num = '2'
        elif match and int(match.group(1)) < 1000:  # Avoid years like 1969
            prop_num = match.group(1)
        else:
            match = False
            
        if match:
            # Save previous proposition end line
            if current_prop:
                current_prop['end'] = i
                propositions.append(current_prop)
            
            # Start new proposition
            current_prop = {
                'number': prop_num,
                'start': i + 1,  # Convert to 1-based line numbers
                'end': None
            }
    
    # Handle last proposition
    if current_prop:
        # Find Part II or end of file
        for i in range(current_prop['start'], len(lines)):
            if 'PART II' in lines[i]:
                current_prop['end'] = i
                break
        else:
            current_prop['end'] = len(lines)
        propositions.append(current_prop)
    
    return propositions

def main():
    file_path = "/Users/danshipper/CascadeProjects/pi-reader/full-text/philosophical_investigations.txt"
    propositions = find_proposition_locations(file_path)
    
    print(f"Found {len(propositions)} propositions")
    print("\nFirst 10 propositions:")
    for prop in propositions[:10]:
        print(f"  {prop['number']}: lines {prop['start']}-{prop['end']}")
    
    print("\nLast 10 propositions:")
    for prop in propositions[-10:]:
        print(f"  {prop['number']}: lines {prop['start']}-{prop['end']}")
    
    # Save to file for use in extraction script
    import json
    with open('/Users/danshipper/CascadeProjects/pi-reader/scripts/proposition_locations.json', 'w') as f:
        json.dump(propositions, f, indent=2)

if __name__ == "__main__":
    main()