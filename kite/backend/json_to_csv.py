import json
import csv

# Load the JSON data
with open('reliance_historical.json', 'r') as f:
    data = json.load(f)

# Extract candle data
candles = data.get('data', {}).get('candles', [])

# Define CSV header
header = ['date', 'open', 'high', 'low', 'close', 'volume']
if candles and len(candles[0]) == 7:
    header.append('oi')

# Write to CSV
with open('reliance_historical.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(header)
    for row in candles:
        writer.writerow(row)

print('CSV file saved as reliance_historical.csv')
