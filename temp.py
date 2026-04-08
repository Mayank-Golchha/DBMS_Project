# # from graphviz import Digraph

# # dot = Digraph("Real Estate ERD", format="png")
# # dot.attr(rankdir="LR")

# # # ---------------- ENTITIES ----------------

# # def entity(name, attributes):
# #     label = f"{name}|"
# #     for attr in attributes:
# #         label += attr + "\\l"
# #     dot.node(name, shape="record", label="{" + label + "}")

# # # Entities
# # entity("agents", [
# #     "agent_id (PK)",
# #     "first_name",
# #     "last_name",
# #     "phone (UQ)",
# #     "email (UQ)",
# #     "hire_date",
# #     "license_no (UQ)"
# # ])

# # entity("localities", [
# #     "locality_id (PK)",
# #     "locality_name",
# #     "city",
# #     "pincode"
# # ])

# # entity("properties", [
# #     "property_id (PK)",
# #     "property_type",
# #     "address_line",
# #     "selling_price",
# #     "monthly_rent",
# #     "size_sqft",
# #     "num_bedrooms",
# #     "year_constructed",
# #     "listing_date",
# #     "status"
# # ])

# # entity("clients", [
# #     "client_id (PK)",
# #     "first_name",
# #     "last_name",
# #     "phone (UQ)",
# #     "email (UQ)",
# #     "client_type"
# # ])

# # entity("sales_transactions", [
# #     "sale_id (PK)",
# #     "sale_price",
# #     "sale_date",
# #     "days_on_market"
# # ])

# # entity("rental_transactions", [
# #     "rental_id (PK)",
# #     "monthly_rent",
# #     "start_date",
# #     "end_date",
# #     "days_on_market"
# # ])

# # # ---------------- RELATIONSHIPS ----------------

# # def relation(from_entity, to_entity, label, many=False, mandatory=True):
# #     arrow = "crow" if many else "normal"
# #     width = "2" if mandatory else "1"

# #     dot.edge(
# #         from_entity,
# #         to_entity,
# #         label=label,
# #         arrowhead=arrow,
# #         penwidth=width
# #     )

# # # properties relations
# # relation("properties", "agents", "listed_by_agent", many=True, mandatory=True)
# # relation("properties", "localities", "located_in", many=True, mandatory=True)

# # # sales_transactions relations
# # relation("sales_transactions", "properties", "property", many=False, mandatory=True)  # 1:1
# # relation("sales_transactions", "agents", "agent", many=True, mandatory=True)
# # relation("sales_transactions", "clients", "buyer", many=True, mandatory=True)
# # relation("sales_transactions", "clients", "seller", many=True, mandatory=True)

# # # rental_transactions relations
# # relation("rental_transactions", "properties", "property", many=True, mandatory=True)
# # relation("rental_transactions", "agents", "agent", many=True, mandatory=True)
# # relation("rental_transactions", "clients", "tenant", many=True, mandatory=True)
# # relation("rental_transactions", "clients", "owner", many=True, mandatory=True)

# # # ---------------- RENDER ----------------
# # dot.render("er_diagram", view=True)








# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
# from reportlab.lib.styles import getSampleStyleSheet
# from reportlab.lib.pagesizes import A4

# # Create document
# doc = SimpleDocTemplate("CS241_Real_Estate_DBMS.pdf", pagesize=A4)
# styles = getSampleStyleSheet()

# content = []

# # Title
# content.append(Paragraph("<b>CS241 REAL ESTATE PROJECT DBMS</b>", styles['Title']))
# content.append(Spacer(1, 20))

# # Assumptions Heading
# content.append(Paragraph("<b>Assumptions</b>", styles['Heading2']))
# content.append(Spacer(1, 10))

# assumptions = [
#     "Each property is listed by exactly one agent.",
#     "A property can either be sold once or rented multiple times.",
#     "Clients can act as buyer, seller, tenant, or owner.",
#     "Each locality belongs to a single city (default assumed Mumbai).",
#     "Days on market is calculated externally and stored in the database.",
#     "Property status is maintained as Available, Sold, or Rented."
# ]

# for a in assumptions:
#     content.append(Paragraph(f"- {a}", styles['Normal']))
#     content.append(Spacer(1, 5))

# content.append(Spacer(1, 15))

# # AI Prompts Heading
# content.append(Paragraph("<b>AI Prompts (Claude)</b>", styles['Heading2']))
# content.append(Spacer(1, 10))

# prompt1 = """Prompt 1:
# "Convert an ER diagram of a real estate system into a normalized relational schema.
# Include tables for agents, properties, clients, and transactions with proper primary and foreign keys."
# """

# prompt2 = """Prompt 2:
# "Enhance the SQL schema by adding constraints such as CHECK, UNIQUE, ENUM,
# and ensure referential integrity between property, agent, and transaction tables."
# """

# content.append(Paragraph(prompt1, styles['Normal']))
# content.append(Spacer(1, 10))
# content.append(Paragraph(prompt2, styles['Normal']))

# content.append(Spacer(1, 15))

# # Contribution Heading
# content.append(Paragraph("<b>Contribution</b>", styles['Heading2']))
# content.append(Spacer(1, 10))

# # Contributions
# contributions = [
#     "<b>Gaurav Murali (2401082):</b> Converted ER diagram into relational schema, identified tables and attributes, and defined primary and foreign key relationships.",

#     "<b>Mayank Golchha (2401122):</b> Designed and refined AI prompts to generate SQL schema, reviewed AI-generated output, and ensured alignment with project requirements.",

#     "<b>Krishna Singh Parmar (2401110):</b> Enhanced schema with constraints such as CHECK, UNIQUE, NOT NULL, ENUM and ensured normalization up to 3NF. Refined transaction tables.",

#     "<b>Harsh Upadhyay (2401092):</b> Implemented schema in MySQL, populated tables with sample data, tested queries, and verified referential integrity."
# ]

# for c in contributions:
#     content.append(Paragraph(c, styles['Normal']))
#     content.append(Spacer(1, 10))

# # AI Disclosure
# content.append(Spacer(1, 10))
# content.append(Paragraph("<b>AI Assistance</b>", styles['Heading3']))
# content.append(Spacer(1, 5))

# ai_text = """AI tools were used for generating initial schema drafts, suggesting SQL constraints,
# and improving structure. Final design, validation, and implementation were completed by the team."""

# content.append(Paragraph(ai_text, styles['Normal']))

# # Build PDF
# doc.build(content)

# print("PDF Generated Successfully!")










