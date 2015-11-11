class CreateShoppeImportLogs < ActiveRecord::Migration

  def change
    create_table "shoppe_import_logs" do |t|
      t.datetime "start_time"
      t.datetime "finish_time"
      t.string "filename"
      t.integer "import_status"
      t.text "log_errors"
      t.integer "user_id"
    end
  end

end