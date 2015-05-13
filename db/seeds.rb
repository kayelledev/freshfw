# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

tax_rate = Shoppe::TaxRate.create!(:name => "HST", :rate => 13.0, :province => "ON", :country => "Canada")
lorem = 'A high style living room with walnut and neutral finishes complemented by chrome and glass pieces to create an eclectic style. Every piece is durable and functional, allowing a casual lifestyle.'

cat1 = Shoppe::ProductCategory.create!(:name => 'Living Rooms')

pro = cat1.products.create!(:name => 'Casual Eclectic', :sku => '1000100', :permalink => 'casual-eclectic', :description => lorem, :short_description => 'A casual eclectic living room', :featured => true)
pro.save!

v1 = pro.variants.create(:name => "Full Style & Function", :sku => "1000201", :permalink => 'casual-electic-full', :price => 1999.00, :tax_rate => tax_rate, :default => true)
v1.save!

v2 = pro.variants.create(:name => "The Bare Minimum", :sku => "1000101", :permalink => 'casual-electic-bare', :price => 1499.00, :tax_rate => tax_rate,:default => false)
v2.save!

v3 = pro.variants.create(:name => "Plus One", :sku => "1000301", :permalink => 'casual-electic-plus', :price => 2499.00, :tax_rate => tax_rate, :default => false)
v3.save!

