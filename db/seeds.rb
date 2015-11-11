# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

# Logistic
# zone generation
zoneA = Shoppe::Zone.where(name: "A").first_or_create
zoneB = Shoppe::Zone.where(name: "B").first_or_create
# cities generation
country = Shoppe::Country.where(name: "Canada").first_or_create
city1 = Shoppe::City.where(name: "Monreal", country_id: country.id, province: "QC").first_or_create
city1.zones << zoneA
city2 = Shoppe::City.where(name: "Toronto", country_id: country.id, province: "ON").first_or_create
city2.zones << zoneA
# supplier generation
supplier1 = Shoppe::Supplier.where(name: "Zuo Modern", warehouse: "Monreal", website: "zuomod").first_or_create
supplier1.zones << zoneB
supplier1_zone = Shoppe::SuppliersZone.where(supplier_id: supplier1.id, zone_id: zoneB.id).first
# freight companies
fcompany1 = Shoppe::FreightCompany.where(name: "Dejong", dc: "High Point", website: "dejong.ca").first_or_create
fcompany1.zones << zoneA
# last mile companies
lmcompany1 = Shoppe::LastMileCompany.where(name: "AMJ", city: "Toronto", address: "Mississauga").first_or_create
lmcompany1.zones << zoneA
lmcompany2 = Shoppe::LastMileCompany.where(name: "VA Transport", city: "Toronto", address: "Bolton").first_or_create
lmcompany2.zones << zoneA
# freight routes
route1 = Shoppe::FreightRoute.where(travel_days: 4, freight_company_id: fcompany1.id, zone_id: zoneA.id, suppliers_zone_id: supplier1_zone).first_or_create

# # Create tax rate for Ontario
# tax_rate = Shoppe::TaxRate.create!(:name => "HST", :rate => 13.0, :province => "ON", :country => "Canada")

# cat1 = Shoppe::ProductCategory.create!(:name => 'Living Rooms')

# # Casual Eclectic Living Room
# desc_casual_eclectic = 'A high style living room with walnut and neutral finishes complemented by chrome and glass pieces to create an eclectic style. Every piece is durable and functional, allowing a casual lifestyle.'

# pro = cat1.products.create!(:name => 'Casual Eclectic', :sku => '1000100', :permalink => 'casual-eclectic', :description => desc_casual_eclectic, :short_description => 'A casual eclectic living room', :featured => true)
# pro.save!

# v1 = pro.variants.create(:name => "Full Style & Function", :sku => "1000201", :permalink => 'casual-electic-full', :price => 1999.00, :tax_rate => tax_rate, :default => true)
# v1.save!

# v2 = pro.variants.create(:name => "The Bare Minimum", :sku => "1000101", :permalink => 'casual-electic-bare', :price => 1499.00, :tax_rate => tax_rate,:default => false)
# v2.save!

# v3 = pro.variants.create(:name => "Plus One", :sku => "1000301", :permalink => 'casual-electic-plus', :price => 2499.00, :tax_rate => tax_rate, :default => false)
# v3.save!

