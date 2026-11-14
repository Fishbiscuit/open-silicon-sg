---
eyebrow: Why open silicon
title: From sand to chip
title_emphasis: chip
intro: >
  Chip design and manufacturing can be expensive. Open tools let more people
  design chips. Sharing a manufacturing run can reduce the cost of making
  them. A published design can be checked against the silicon.
lead_note: Industry
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
check_image: exhibits/pic-die.webp
check_title: A real chip, and the plan of its parts
check_text: >
  This microcontroller was photographed after its top layers were removed.
  Its design is not published, so its parts were worked out from the
  silicon. Drag to compare the photograph with that plan.
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
    fact: >
      Quartz becomes silicon. It is purified, melted and grown into a single
      crystal, then sliced into wafers.
  - name: Design
    fact: >
      Someone draws the circuit. Open design tools and information about the
      manufacturing process let more people design chips.
  - name: Print
    fact: >
      A mask holds a pattern. Light shines through it to transfer the pattern
      onto the wafer.
  - name: Build up
    fact: >
      Machines add and remove material to build the chip in layers. The
      process can take weeks to months.
  - name: Test
    fact: Fine needles touch every chip on the wafer and run a test before anything is cut.
  - name: Cut
    fact: A thin diamond blade cuts the wafer into individual chips.
  - name: Package
    fact: Each chip is mounted in a package, connected to its pins and sealed.
  - name: Place
    fact: Machines place the chips on a circuit board, and an oven melts the solder that holds them.
  - name: Use
    fact: The board goes into the phone in your hand, beside dozens of other chips.
---
