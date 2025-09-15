#!/usr/bin/env python3
"""
Script to clean up duplicate user_organization_roles in seed.sql
Ensures only one active role per (user_id, organization_id) combination
"""

import re
import sys
from collections import defaultdict

def extract_user_org_roles_data(content):
    """Extract the user_organization_roles INSERT statement"""
    # Find the user_organization_roles INSERT statement
    pattern = r"INSERT INTO \"public\"\.\"user_organization_roles\".*?VALUES\s*(.*?);\s*\n\n"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("No user_organization_roles INSERT statement found")
        return None, None, None
    
    start_pos = match.start()
    end_pos = match.end()
    values_text = match.group(1)
    
    return start_pos, end_pos, values_text

def parse_role_entries(values_text):
    """Parse the VALUES entries into structured data"""
    entries = []
    
    # Split by lines and find entries
    lines = values_text.strip().split('\n')
    current_entry = ""
    
    for line in lines:
        line = line.strip()
        if line.startswith('('):
            if current_entry:
                entries.append(parse_single_entry(current_entry))
            current_entry = line
        else:
            current_entry += " " + line
    
    # Don't forget the last entry
    if current_entry:
        entries.append(parse_single_entry(current_entry))
    
    return entries

def parse_single_entry(entry_text):
    """Parse a single entry like ('id', 'user_id', ...)"""
    # Remove leading/trailing parentheses and comma
    entry_text = entry_text.strip()
    if entry_text.endswith(','):
        entry_text = entry_text[:-1]
    if entry_text.startswith('(') and entry_text.endswith(')'):
        entry_text = entry_text[1:-1]
    
    # Split by commas, but be careful with quoted strings
    parts = []
    current_part = ""
    in_quotes = False
    
    for char in entry_text:
        if char == "'" and not in_quotes:
            in_quotes = True
            current_part += char
        elif char == "'" and in_quotes:
            in_quotes = False
            current_part += char
        elif char == ',' and not in_quotes:
            parts.append(current_part.strip())
            current_part = ""
        else:
            current_part += char
    
    if current_part:
        parts.append(current_part.strip())
    
    if len(parts) >= 5:
        return {
            'id': parts[0].strip("'"),
            'user_id': parts[1].strip("'"),
            'organization_id': parts[2].strip("'"),
            'role_id': parts[3].strip("'"),
            'is_active': parts[4].strip().lower() == 'true',
            'original': entry_text
        }
    return None

def deduplicate_roles(entries):
    """Remove duplicates, keeping the highest priority role for each (user_id, organization_id) where is_active=true"""
    
    # Role hierarchy (higher number = higher priority)
    role_hierarchy = {
        '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8': 1,  # user
        '98ac5906-8cf7-4c2d-b587-be350930f518': 2,  # requester
        '35feea56-b0a6-4011-b09f-85cb6f6727f3': 3,  # storage_manager
        '700b7f8d-be79-474e-b554-6886a3605277': 4,  # tenant_admin
        '86234569-43e9-4a18-83cf-f8584d84a752': 5,  # super_admin
    }
    
    role_names = {
        '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8': 'user',
        '98ac5906-8cf7-4c2d-b587-be350930f518': 'requester',
        '35feea56-b0a6-4011-b09f-85cb6f6727f3': 'storage_manager',
        '700b7f8d-be79-474e-b554-6886a3605277': 'tenant_admin',
        '86234569-43e9-4a18-83cf-f8584d84a752': 'super_admin',
    }
    
    # Group by (user_id, organization_id)
    groups = defaultdict(list)
    kept_entries = []
    
    for entry in entries:
        if entry is None:
            continue
            
        key = (entry['user_id'], entry['organization_id'])
        
        if entry['is_active']:
            groups[key].append(entry)
        else:
            # Keep all inactive entries
            kept_entries.append(entry)
    
    # For each group of active entries, keep the one with highest role priority
    for key, group_entries in groups.items():
        if len(group_entries) == 1:
            kept_entries.append(group_entries[0])
        else:
            print(f"Found {len(group_entries)} active roles for user {key[0]} in org {key[1]}")
            
            # Sort by role hierarchy (highest priority first)
            def get_role_priority(entry):
                return role_hierarchy.get(entry['role_id'], 0)
            
            group_entries.sort(key=get_role_priority, reverse=True)
            kept_entry = group_entries[0]  # Highest priority role
            kept_entries.append(kept_entry)
            
            kept_role_name = role_names.get(kept_entry['role_id'], 'unknown')
            print(f"  Keeping: {kept_entry['id']} (role: {kept_role_name})")
            
            for removed in group_entries[1:]:
                removed_role_name = role_names.get(removed['role_id'], 'unknown')
                print(f"  Removing: {removed['id']} (role: {removed_role_name})")
    
    return kept_entries

def rebuild_insert_statement(entries):
    """Rebuild the INSERT statement with cleaned data"""
    if not entries:
        return ""
    
    values_parts = []
    for entry in entries:
        values_parts.append(f"({entry['original']})")
    
    insert_statement = 'INSERT INTO "public"."user_organization_roles" ("id", "user_id", "organization_id", "role_id", "is_active", "created_at", "updated_at", "created_by", "updated_by") VALUES\n'
    insert_statement += ',\n'.join([f"\t{part}" for part in values_parts])
    insert_statement += ";\n\n"
    
    return insert_statement

def main():
    input_file = "supabase/seed.sql"
    output_file = "supabase/seed_cleaned.sql"
    
    print(f"Reading {input_file}...")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return 1
    
    print("Extracting user_organization_roles data...")
    start_pos, end_pos, values_text = extract_user_org_roles_data(content)
    
    if start_pos is None:
        print("Could not find user_organization_roles data")
        return 1
    
    print("Parsing role entries...")
    entries = parse_role_entries(values_text)
    print(f"Found {len(entries)} total entries")
    
    print("Deduplicating entries...")
    cleaned_entries = deduplicate_roles(entries)
    print(f"Kept {len(cleaned_entries)} entries after deduplication")
    
    print("Rebuilding INSERT statement...")
    new_insert = rebuild_insert_statement(cleaned_entries)
    
    # Replace the old INSERT statement with the new one
    new_content = content[:start_pos] + new_insert + content[end_pos:]
    
    print(f"Writing cleaned data to {output_file}...")
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("✅ Cleanup completed successfully!")
        print(f"Original entries: {len(entries)}")
        print(f"Cleaned entries: {len(cleaned_entries)}")
        print(f"Removed duplicates: {len(entries) - len(cleaned_entries)}")
        
    except Exception as e:
        print(f"Error writing file: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
    
""" generated by AI """