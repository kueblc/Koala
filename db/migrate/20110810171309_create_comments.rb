class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.integer :user_id
      t.integer :project_id
      t.text :content
      t.datetime :date_posted
      t.datetime :date_modified

      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
