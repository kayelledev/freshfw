class AddCountryProvinceToTaxRates < ActiveRecord::Migration
  def change
    add_column :shoppe_tax_rates, :country, :string
    add_column :shoppe_tax_rates, :province, :string
  end
end
