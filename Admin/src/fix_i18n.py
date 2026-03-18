import re

with open('i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix typo 1: 'Uy tiên:' -> 'Ưu tiên:' (msg.priority in VI section)
old1 = "'msg.priority': 'Uy ti\u00EAn:'"
new1 = "'msg.priority': '\u01B0u ti\u00EAn:'"

# Fix typo 2: 'Trat lời của Admin:' -> 'Trả lời của Admin:' (msg.adminResponse in VI section)
old2 = "'msg.adminResponse': 'Trat l\u1EDDi c\u1EE7a Admin:'"
new2 = "'msg.adminResponse': 'Tr\u1EA3 l\u1EDDi c\u1EE7a Admin:'"

# Fix the corruption introduced in line 8: the duplicate tail starting with ,ext'
# Pattern: after 'inv.restockNeeded': 'Cần nhập hàng!', there is corrupt text: ext': 'Tiếp',...repeating
# up to another occurrence of 'inv.restockNeeded'
corrupt_marker = "restockNeeded': 'C\u1EA7n nh\u1EADp h\u00E0ng!',ext'"
count_corrupt = content.count(corrupt_marker)
count1 = content.count(old1)
count2 = content.count(old2)

print(f'Corrupt occurrences: {count_corrupt}')
print(f'Typo1 occurrences: {count1}')
print(f'Typo2 occurrences: {count2}')

if count_corrupt > 0:
    # Get the raw position of the corruption
    idx = content.find(corrupt_marker)
    print(f'Corruption at index: {idx}')
    print(f'Context (100 chars): {repr(content[idx:idx+100])}')
    
    # Find start of the corrupt segment (the comma before "ext'")
    corrupt_start = content.find("',ext'", idx - 5)
    print(f'Corrupt start: {corrupt_start}')
    
    # The corrupt segment ends at the second occurrence of restockNeeded
    # Find the end: we need to find where the original valid data resumes
    # After the corruption the file should continue with the line after  
    # 'inv.restockNeeded': 'Cần nhập hàng!',
    # Look for the second occurrence after the corruption
    end_of_corrupt_data = content.find("'inv.restockNeeded': 'C\u1EA7n nh\u1EADp h\u00E0ng!',", corrupt_start + 10)
    if end_of_corrupt_data > 0:
        end_of_corrupt_segment = end_of_corrupt_data + len("'inv.restockNeeded': 'C\u1EA7n nh\u1EADp h\u00E0ng!',")
        print(f'Corrupt segment: from {corrupt_start} to {end_of_corrupt_segment}')
        # Remove the corrupt segment (keep the clean ending)
        content = content[:corrupt_start + 1] + content[end_of_corrupt_segment:]
        print('Fixed corruption')

if count1 > 0:
    content = content.replace(old1, new1)
    print('Fixed typo1')

if count2 > 0:
    content = content.replace(old2, new2)
    print('Fixed typo2')

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done. File saved.')
