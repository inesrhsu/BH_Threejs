def combine_files(file1, file2, file3, file4, output_file):


    with open(file1, 'r') as f1, open(file2, 'r') as f2, open(file3, 'r') as f3, open(file4, 'r') as f4:

            lines1 = f1.readlines()
            lines2 = f2.readlines()
            lines3 = f3.readlines()
            lines4 = f4.readlines()

            with open(output_file, 'w') as output:
                # Iterate over the lines and combine values
                for l1, l2, l3, l4 in zip(lines1, lines2, lines3, lines4):
                    # Strip newline characters and combine values with commas
                    combined = f"{l1.strip()},{l2.strip()},{l3.strip()},{l4.strip()},\n"
                    output.write(combined)



# Usage example
# combine_files('src/data/star_r.txt', 'src/data/star_g.txt', 'src/data/star_b.txt', 'starsColors.txt')
combine_files('src/raw_data/gas_r.txt', 'src/raw_data/gas_g.txt', 'src/raw_data/gas_b.txt', 'src/raw_data/gas_a.txt', 'gasColors.txt')