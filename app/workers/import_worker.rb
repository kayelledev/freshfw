require 'roo'

class ImportWorker

  include Sidekiq::Worker
  sidekiq_options :queue => :mass_import

  def perform(file, email, import_log_id)
    field_array = ['Product Name', 'SKU', 'Category Name', 'Subcategory Name', 'Permalink', 'Description', 'Short Description', 'Featured',
                   "What's in the box?", 'Width', 'Height', 'Depth', 'Seat Width', 'Seat Depth', 'Seat Height', 'Arm Height',
                   'CAD Price', 'USA Price', 'Default Image', 'Image2', 'Image3', 'Image4', 'Image5', 'Image6', 'Supplier']
    attr_active_array = ['Color', 'Item 2 Width', 'Item 2 Depth', 'Item 2 Height', 'Item 3 Width', 'Item 3 Depth', 'Item 3 Height', 'NW', 'Technical Description',
                         'Features', 'Instructions', 'Outdoor']
    errors = []
    import_log = Shoppe::ImportLog.find(import_log_id)
    begin
      spreadsheet = case File.extname(file)
        when ".csv" then Roo::CSV.new(file)
        when ".xls" then Roo::Excel.new(file)
        when ".xlsx" then Roo::Excelx.new(file)
        else raise I18n.t('shoppe.imports.errors.unknown_format', filename: File.original_filename)
      end
    rescue
      errors << "Unknown file format"
      import_log.update(import_status: 2, finish_time: Time.now, log_errors: errors.join("\n"))
    end
    if errors.empty?
      spreadsheet.default_sheet = spreadsheet.sheets.first
      header = spreadsheet.row(1)

      success_count = 0
      (2..spreadsheet.last_row).each_with_index do |i, index|
        begin
          row = Hash[[header, spreadsheet.row(i)].transpose]
          product = Shoppe::Product.where(name: row["Product Name"], sku: row['SKU']).first_or_create
          if row["Subcategory Name"].present?
            product.product_category_id = Shoppe::ProductCategory.where(name: row["Subcategory Name"]).first_or_create.id
          else
            product.product_category_id = nil
          end
          row["Category Name"] = nil
          #product.product_subcategory_id = Shoppe::ProductCategory.where(name: row["Subcategory Name"]).first_or_create.id
          #product.permalink = row["Permalink"] if row["Permalink"]
          product.description = row["Description"] if row["Description"]
          product.short_description = row["Short Description"] if row["Short Description"]
          product.save!
          product.featured = row["Featured"].to_i if row["Featured"]
          product.in_the_box = row["What's in the box?"] if row["What's in the box?"]
          product.width = row["Width"].to_f if row["Width"]
          product.height = row["Height"].to_f if row["Height"]
          product.depth = row["Depth"].to_f if row["Depth"]
          product.seat_width = row["Seat Width"].to_f if row["Seat Width"]
          product.seat_depth = row["Seat Depth"].to_f if row["Seat Depth"]
          product.seat_height = row["Seat Height"].to_f if row["Seat Height"]
          product.arm_height = row["Arm Height"].to_f if row["Arm Height"]
          product.price = row["CAD Price"].to_d if row["CAD Price"]
          product.cost_price = row["USA Price"].to_d if row["USA Price"]
          product.url_default_image = row["Default Image"] if row["Default Image"]
          product.url_image2 = row["Image2"] if row["Image2"]
          product.url_image3 = row["Image3"] if row["Image3"]
          product.url_image4 = row["Image4"] if row["Image4"]
          product.url_image5 = row["Image5"] if row["Image5"]
          product.url_image6 = row["Image6"] if row["Image6"]
          if row["Supplier"].present?
            product.supplier_id = Shoppe::Supplier.where(name: row["Supplier"]).first_or_create.id
          else
            product.supplier_id = nil
          end
          product.save!
          field_array.each{|element| row.delete(element)}
          row.each do |key, value|
            next unless value.present?
            product_attr = Shoppe::ProductAttribute.where(product_id: product.id, key: key).first_or_create
            product_attr.public = attr_active_array.include?(key)
            product_attr.searchable = false
            product_attr.value = value
            product_attr.save!
          end
        success_count += 1
        rescue => error
          errors << {error: error.message, row_index: index + 2}
        end
      end
      if errors.empty?
        errors << 'Import succeess'
        errors << "Success imported #{success_count} rows"
        import_log.update(import_status: 1, finish_time: Time.now, log_errors: errors.join("\n"))
      else
        errors = errors.map{ |e| "Row number #{e[:row_index]}. Error: #{e[:error]}" }
        errors.unshift("Success imported #{success_count} rows", "")
        import_log.update(import_status: 2, finish_time: Time.now, log_errors: errors.join("\n"))
      end
    end
    begin
      Shoppe::ImportMailer.imported(email, errors).deliver_now
      FileUtils::rm(file)
    rescue
    end
  end

end