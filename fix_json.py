#!/usr/bin/env python3
import json
import re

def fix_json_quotes(text):
    """Fix unescaped quotes in JSON strings"""
    # This is a simplified approach - we'll need to be careful
    # Replace quotes that are inside string values but not escaped
    
    # First, let's try to load it and see where it fails
    try:
        json.loads(text)
        print("JSON is valid!")
        return text
    except json.JSONDecodeError as e:
        print(f"JSON error at position {e.pos}: {e.msg}")
        print(f"Context: {text[max(0, e.pos-50):e.pos+50]}")
    
    # Try to fix common issues
    # Replace unescaped quotes within strings
    # This is tricky because we need to identify string boundaries
    
    lines = text.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Check if this line contains a JSON string value
        if '": "' in line and line.strip().endswith('",') or line.strip().endswith('"'):
            # Extract the string value part
            match = re.search(r'"([^"]+)"\s*:\s*"(.*)"(,?)$', line)
            if match:
                key = match.group(1)
                value = match.group(2)
                comma = match.group(3)
                
                # Escape any unescaped quotes in the value
                # Look for quotes that aren't preceded by backslash
                value = re.sub(r'(?<!\\)"', r'\"', value)
                
                # Reconstruct the line
                indent = len(line) - len(line.lstrip())
                line = ' ' * indent + f'"{key}": "{value}"{comma}'
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

# Read the file
with open('/Users/danshipper/CascadeProjects/pi-reader/src/data/comprehensive_explanations_full.json', 'r') as f:
    content = f.read()

# Try to fix it
fixed_content = fix_json_quotes(content)

# Try to parse it again
try:
    data = json.loads(fixed_content)
    print("Successfully fixed JSON!")
    
    # Write it back with proper formatting
    with open('/Users/danshipper/CascadeProjects/pi-reader/src/data/comprehensive_explanations_full_fixed.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("Written to comprehensive_explanations_full_fixed.json")
except json.JSONDecodeError as e:
    print(f"Still has errors at position {e.pos}: {e.msg}")
    print(f"Context: {fixed_content[max(0, e.pos-100):e.pos+100]}")