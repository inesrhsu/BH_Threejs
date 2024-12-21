def combine_files(gasPos_file, sLen_file, output_file):


    with open(gasPos_file, 'r') as gasPosf, open(sLen_file, 'r') as sLenf:

      gasPos = gasPosf.readlines()
      sLen = sLenf.readlines()

      with open(output_file, 'w') as output:
        # Iterate over the lines and combine values
        for gasPos, sLen in zip(gasPos, sLen):
          # Strip newline characters and combine values with commas
          combined = f"{gasPos.strip()}{sLen.strip()},\n"
          output.write(combined)


# Usage example
# combine_files('src/data/star_r.txt', 'src/data/star_g.txt', 'src/data/star_b.txt', 'starsColors.txt')
combine_files('src/aux/adjustedGasPositions.txt', 'src/raw_data/gas_sLen.txt', 'adjustedGasPositionsWSize.txt')