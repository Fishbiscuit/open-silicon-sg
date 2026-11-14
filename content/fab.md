---
eyebrow: Why open silicon
title: From sand to chip
title_emphasis: chip
intro: >
  Chip design and manufacturing can be expensive. Open tools let more people
  design chips. Sharing a manufacturing run can reduce the cost of making
  them. A published design can be checked against the silicon.
scrub_label: Move through chip fabrication
closing_label: Check
closing_title: Check the chip against its design
closing: >
  When a chip's design is published, you can photograph the die and compare
  it with the drawing.
# Under the line: a real die photograph beside the floorplan read from it.
# Leave check_image out to hide it. Part boxes are in the photograph's own
# pixels (1000 x 1111) and are coarse, matched by hand to the source floorplan.
# Source: Andrew D. Zonenberg, PIC12F683 report (2025), figure 25, as used in
# the ITE3 companion's Chip Detective.
# Comparison stays off the homepage; Chip Detective is the place to explore it.
# check_image: exhibits/pic-die.webp
check_title: There's more than meets the eye in every chip
check_slider: Compare the photograph with the plan of its parts
check_overlay_label: plan overlay
check_photo_label: Photograph
check_plan_label: Plan
check_credit: PIC12F683 die. Photograph and analysis by Andrew D. Zonenberg.
check_parts:
  - label: CPU
    rect: [275, 195, 211, 309]
  - label: RAM
    rect: [69, 612, 131, 154]
  - label: EEPROM
    rect: [69, 322, 145, 221]
  - label: Flash memory
    rect: [340, 573, 425, 359]
  - label: ADC
    rect: [757, 274, 162, 207]
stations:
  - name: Sand to wafer
    fact: Quartz becomes pure silicon, grown into crystals and sliced into wafers.
  - name: Design
    fact: Draw a circuit with open design tools.
  - name: Print
    fact: Light transfers the mask's pattern onto the wafer.
  - name: Build up
    fact: Machines add and remove material in layers.
  - name: Test
    fact: Fine needles test each chip on the wafer.
  - name: Cut
    fact: A diamond blade cuts the wafer into chips.
  - name: Package
    fact: Connect each chip to pins and seal it.
  - name: Place
    fact: Place chips on a board and solder them.
  - name: Use
    fact: The board goes into your phone.
---
