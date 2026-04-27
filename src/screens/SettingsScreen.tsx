import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Linking,
  Share,
  TextInput,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import notifee, { TriggerType, RepeatFrequency, TimestampTrigger, AuthorizationStatus } from '@notifee/react-native';

import { Colors, Spacing, FontSize, BorderRadius, Shadows , useThemeColors} from '../theme';
import { useGoalStore } from '../store/useGoalStore';
import { mmkvStorage } from '../store/storage';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const Colors = useThemeColors();
  const styles = createStyles(Colors);

  const settings = useGoalStore((s) => s.settings);
  const updateSettings = useGoalStore((s) => s.updateSettings);
  const goals = useGoalStore((s) => s.goals);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your goals, steps, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            mmkvStorage.clearAll();
            // Reset the store by re-loading
            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
          },
        },
      ],
    );
  };

  const [availableBackups, setAvailableBackups] = React.useState<any[]>([]);
  const [importModalVisible, setImportModalVisible] = React.useState(false);
  const [timePickerVisible, setTimePickerVisible] = React.useState(false);
  const [pickerHour, setPickerHour] = React.useState('09');
  const [pickerMin, setPickerMin] = React.useState('00');
  const [pickerAmPm, setPickerAmPm] = React.useState('AM');

  const scheduleDailyReminder = async (timeString: string, enabled: boolean) => {
    await notifee.cancelAllNotifications();
    if (!enabled) return;

    try {
      const channelId = await notifee.createChannel({
        id: 'daily-reminders',
        name: 'Goal Reminders',
        sound: 'default'
      });

      const [time, ampm] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const now = new Date();
      let triggerDate = new Date();
      triggerDate.setHours(hours, minutes, 0, 0);

      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        {
          title: '🎯 Time to crush your goals!',
          body: 'Take 5 minutes today to complete a step towards your big dreams.',
          android: {
            channelId,
            autoCancel: true,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
          },
        },
        trigger,
      );
    } catch (e) {
      console.log('Notification error:', e);
    }
  };

  const handleToggleNotifications = async (v: boolean) => {
    if (v) {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED || settings.authorizationStatus === AuthorizationStatus.PROVISIONAL) {
        updateSettings({ notificationsEnabled: true });
        scheduleDailyReminder(useGoalStore.getState().settings.dailyReminderTime || '09:00 AM', true);
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your phone settings.');
      }
    } else {
      updateSettings({ notificationsEnabled: false });
      scheduleDailyReminder('', false);
    }
  };

  const saveNewReminderTime = () => {
    const newTimeStr = `${pickerHour.padStart(2, '0')}:${pickerMin.padStart(2, '0')} ${pickerAmPm}`;
    updateSettings({ dailyReminderTime: newTimeStr });
    
    if (settings.notificationsEnabled) {
      scheduleDailyReminder(newTimeStr, true);
    }
    
    setTimePickerVisible(false);
    Alert.alert('Saved ✨', `You will be reminded at ${newTimeStr} every day.`);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to save your backups.',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // Android 13+ or iOS handles differently, assume true for Downloads/Documents scoped access
  };

  const getBackupDirPath = () => {
    // Exact folder structure requested by user
    return RNFS.ExternalStorageDirectoryPath + '/Documents/GoalFlow/backups';
  };

  const generateBackupFile = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot create backup without storage permission.');
        return;
      }

      const dataStr = mmkvStorage.getString('goalflow-store');
      if (!dataStr) {
        Alert.alert('Empty', 'No data to export.');
        return;
      }

      const dir = getBackupDirPath();
      const exists = await RNFS.exists(dir);
      if (!exists) {
        await RNFS.mkdir(dir);
      }

      const dateStr = new Date().toISOString().split('T')[0];
      // File format requested by user: backup_YYYY-MM-DD.json
      const fileName = `backup_${dateStr}.json`;
      const filePath = `${dir}/${fileName}`;

      await RNFS.writeFile(filePath, dataStr, 'utf8');
      Alert.alert('Success ✨', `Backup saved to:\nDocuments > GoalFlow > backups > ${fileName}`);
    } catch (err) {
      console.log('Export Error:', err);
      Alert.alert('Error', 'Failed to generate backup file.');
    }
  };

  const openImportDialog = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      const dir = getBackupDirPath();
      const exists = await RNFS.exists(dir);
      if (!exists) {
        Alert.alert('No Backups', 'You have no local backups inside Documents/GoalFlow/backups.');
        return;
      }

      const files = await RNFS.readDir(dir);
      const jsonFiles = files.filter(f => f.name.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        Alert.alert('No Backups', 'No .json backup files found.');
        return;
      }

      setAvailableBackups(jsonFiles);
      setImportModalVisible(true);
    } catch (error) {
       console.log('Import list error:', error);
       Alert.alert('Error', 'Could not read backups folder.');
    }
  };

  const processImportFile = async (filePath: string) => {
    try {
      const dataStr = await RNFS.readFile(filePath, 'utf8');
      const parsed = JSON.parse(dataStr);
      
      if (!parsed.state || !parsed.state.goals) {
        Alert.alert('Invalid', 'The selected backup file is corrupted or invalid.');
        return;
      }

      Alert.alert(
        'Warning',
        'This will OVERWRITE all your current goals with the imported data. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore Data',
            style: 'destructive',
            onPress: () => {
              mmkvStorage.set('goalflow-store', dataStr);
              setImportModalVisible(false);
              Alert.alert('Success! 🎉', 'Data restored successfully! Please restart the app heavily to reflect changes.');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Invalid File', 'The backup file could not be read properly.');
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          'Take control of your life and achieve your dreams step by step with GoalFlow! 🎯\n\nBreak your big goals into small milestones, track your daily progress, and celebrate your wins.\nDownload now and start your journey:\n[YOUR_APP_LINK_HERE]',
      });
    } catch (error) {
      console.log('Error sharing app:', error);
    }
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    right,
    onPress,
    delay = 0,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    delay?: number;
  }) => (
    <View >
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onPress}
        disabled={!onPress && !right}
        activeOpacity={0.7}
      >
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {right}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.section}>
          <SettingRow
            icon="🔔"
            title="Daily Reminders"
            subtitle="Get reminded to work on your goals"
            delay={100}
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.border, true: Colors.primaryFaded }}
                thumbColor={
                  settings.notificationsEnabled
                    ? Colors.primary
                    : Colors.textMuted
                }
              />
            }
          />
          <SettingRow
            icon="⏰"
            title="Reminder Time"
            subtitle={settings.dailyReminderTime || '09:00 AM'}
            delay={200}
            onPress={() => {
              if (!settings.notificationsEnabled) {
                Alert.alert('Notice', 'Please enable Daily Reminders first.');
                return;
              }
              
              const current = settings.dailyReminderTime || '09:00 AM';
              const [time, ampm] = current.split(' ');
              const [h, m] = time.split(':');
              setPickerHour(h);
              setPickerMin(m);
              setPickerAmPm(ampm);
              setTimePickerVisible(true);
            }}
          />
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.section}>
          <SettingRow
            icon="📤"
            title="Backup Data"
            subtitle="Save file to Documents/GoalFlow"
            delay={300}
            onPress={generateBackupFile}
          />
          <SettingRow
            icon="📥"
            title="Restore Data"
            subtitle="Import from backup file"
            delay={350}
            onPress={openImportDialog}
          />
          <SettingRow
            icon="🗑️"
            title="Clear All Data"
            subtitle="Delete everything and start fresh"
            delay={400}
            onPress={handleClearData}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.section}>
          <SettingRow
            icon="📱"
            title="GoalFlow"
            subtitle="Version 1.0.0"
            delay={500}
          />
          <SettingRow
            icon="🔗"
            title="Share GoalFlow"
            subtitle="Motivate your friends to use it"
            delay={550}
            onPress={handleShareApp}
          />
          <SettingRow
            icon="⭐"
            title="Rate This App"
            subtitle="Help us improve with your feedback"
            delay={600}
            onPress={() => {
              Alert.alert('Thank you!', 'Rating will be available on the store soon.');
            }}
          />
          <SettingRow
            icon="🐛"
            title="Report a Bug"
            subtitle="Let us know about issues"
            delay={700}
            onPress={() => {
              Linking.openURL('mailto:support@goalflow.app');
            }}
          />
        </View>

        {/* Stats summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{goals.length}</Text>
              <Text style={styles.statLabel}>Goals Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {goals.filter((g) => g.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.info }]}>
                {goals.reduce((sum, g) => sum + g.steps.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {goals.reduce(
                  (sum, g) => sum + g.steps.filter((s) => s.completed).length,
                  0,
                )}
              </Text>
              <Text style={styles.statLabel}>Steps Done</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Import Modal */}
      {importModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restore Backup</Text>
            <Text style={styles.modalText}>
              Select a backup file from Documents to restore your goals.
            </Text>
            <ScrollView style={styles.backupsList} showsVerticalScrollIndicator={false}>
              {availableBackups.map((file, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.backupFileItem}
                  onPress={() => processImportFile(file.path)}
                >
                  <Text style={styles.backupFileIcon}>📄</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.backupFileName}>{file.name}</Text>
                    <Text style={styles.backupFileDate}>{new Date(file.mtime).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: Colors.border, flex: 1 }]} onPress={() => setImportModalVisible(false)}>
                 <Text style={[styles.closeBtnText, { color: Colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Custom JS Time Picker Modal */}
      {timePickerVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reminder Time</Text>
            <Text style={styles.modalText}>
              When would you like to be notified?
            </Text>
            
            <View style={styles.timePickerRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({length: 12}).map((_, i) => {
                    const h = (i + 1).toString().padStart(2, '0');
                    return (
                      <TouchableOpacity key={h} onPress={() => setPickerHour(h)} style={[styles.timeSlot, pickerHour === h && styles.timeSlotActive]}>
                        <Text style={[styles.timeSlotText, pickerHour === h && { color: Colors.primary }]}>{h}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              <Text style={styles.timeColon}>:</Text>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({length: 60}).map((_, i) => {
                    const m = i.toString().padStart(2, '0');
                    return (
                      <TouchableOpacity key={m} onPress={() => setPickerMin(m)} style={[styles.timeSlot, pickerMin === m && styles.timeSlotActive]}>
                        <Text style={[styles.timeSlotText, pickerMin === m && { color: Colors.primary }]}>{m}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              <View style={styles.ampmColumn}>
                <TouchableOpacity onPress={() => setPickerAmPm('AM')} style={[styles.ampmSlot, pickerAmPm === 'AM' && styles.ampmSlotActive]}>
                  <Text style={[styles.ampmText, pickerAmPm === 'AM' && { color: Colors.primary }]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPickerAmPm('PM')} style={[styles.ampmSlot, pickerAmPm === 'PM' && styles.ampmSlotActive]}>
                  <Text style={[styles.ampmText, pickerAmPm === 'PM' && { color: Colors.primary }]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: Colors.border, flex: 1, marginRight: Spacing.sm }]} onPress={() => setTimePickerVisible(false)}>
                 <Text style={[styles.closeBtnText, { color: Colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeBtn, { flex: 1, marginLeft: Spacing.sm }]} onPress={saveNewReminderTime}>
                 <Text style={styles.closeBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: Spacing.base,
  },
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  statsTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    ...Shadows.card,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  backupsList: {
    maxHeight: 250,
    marginBottom: Spacing.xl,
  },
  backupFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backupFileIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  backupFileName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  backupFileDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '700',
  },
  timeScroll: {
    width: '100%',
  },
  timeSlot: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  timeSlotActive: {
    backgroundColor: Colors.primaryFaded,
  },
  timeSlotText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeColon: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginHorizontal: Spacing.sm,
    paddingBottom: 20,
  },
  ampmColumn: {
    width: 60,
    marginLeft: Spacing.md,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ampmSlot: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ampmSlotActive: {
    backgroundColor: Colors.primaryFaded,
    borderColor: Colors.primary,
  },
  ampmText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
